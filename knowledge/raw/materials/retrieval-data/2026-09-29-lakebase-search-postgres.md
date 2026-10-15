# Lakebase Search: State-of-the-art full text and vector search for Postgres

- **来源**: Databricks Blog
- **链接**: https://www.databricks.com/blog/lakebase-search-state-art-full-text-and-vector-search-postgres
- **归档日期**: 2026-09-29
- **标签**: 向量搜索, PostgreSQL, BM25, 混合搜索, Lakebase, AI Agent

## 一句话摘要

Databricks 为 Lakebase Postgres 推出两个 GA 扩展：lakebase_vector（IVF 分层聚类 + RaBitQ 二进制量化，替代 pgvector）和 lakebase_text（原生 BM25），实现 serverless、按用量计费的混合搜索，面向 AI Agent 的高并发检索场景。

## 要点

- **pgvector 的三大痛点**: (1) 索引必须全驻内存，100M×768 维约需 330GB RAM，溢出到磁盘后性能下降 10-50 倍；(2) 索引构建慢（标准云实例上建 100M 索引近 50 小时），写入和 REINDEX 阻塞生产；(3) 单 backend 进程查询，无法并行，recall 和 QPS 不可兼得。
- **lakebase_vector**: 分层 IVF 聚类（向量按聚类存成连续块，查询只读候选块，变随机读为顺序读）+ RaBitQ 二进制量化（1bit/维，压缩约 32 倍）；查询先扫量化码选候选，再全精度重排；块独立所以单查询可跨 CPU 核并行；过滤谓词在扫描块时内联执行。
- **Serverless**: 存算分离，无状态节点，按需缓存热点数据，闲时缩到 0；冷启动 P90 仅 1.13 秒（100M×768 维），100M 向量可在 1 个 CU 上提供服务；索引构建可 offload 到 Spark 分布式构建，耗时从小时级降到分钟级。
- **lakebase_text**: 原生 BM25，带全局 IDF 权重；遍历时用 score 上界跳过不可能进 top-K 的 posting 块，比 tsvector+GIN 更快。
- **混合搜索**: 单条 SQL 内融合语义向量搜索 + BM25 关键词 + 标准 SQL 过滤，并直接 join 在线业务表。
- **数据**: VectorDBBench 100M 上吞吐是次优系统的 2 倍，比某云 Postgres+pgvector 便宜 4 倍；P99 延迟 71ms @ 97% recall；客户 Conexiom 用 100M 行做 BM25 混合搜索，计算资源减半。

## 原文

Traditional OLTP systems weren't built for the search demands of AI agents. They require low-latency, high-accuracy retrieval across all your data and often execute massive parallel searches. Until now, solving this meant duct-taping a standalone search engine to your primary database with an ETL pipeline.

But what if your OLTP database could just run the search workload efficiently?

Today, we are bringing a fast and scalable search engine to Lakebase Postgres via two extensions: lakebase_vector (scalable approximate neighbor search) and lakebase_text (bm25 full-text search). Both extensions are generally available on AWS and Azure.

With lakebase_vector, Postgres is now at the frontier of vector search. It outcompetes the efficiency and scalability of a dedicated search engine. On the VectorDBBench 100M benchmark, it delivers twice the throughput of the next best system and is 4 times cheaper than a cloud Postgres vendor using pgvector, and that is before accounting for additional saving due to autoscaling.

It maintains this performance without sacrificing accuracy. In our tests, lakebase_vector delivered a P99 latency of 71 milliseconds at 97% recall.

Lakebase Postgres now has state-of-the-art search capabilities, and we've seen customers like Conexiom run hybrid search with BM25 on over 100 million rows with half the compute footprint of their previous pgvector setup. They now have a database for all OLTP and search workloads that is completely serverless and scales to their needs.

> Lakebase Search gives us a whole new level of scalability over pgvector, and unlocks BM25 in the same serverless database. We use Lakebase to connect data to our agents at scale. —Jordan Voves, AI/ML Architect @ Conexiom

## Why pgvector hits a wall at scale

For most Postgres users, search starts with pgvector. It allows vector similarity search through index algorithms like HNSW and IVFFlat over data natively in Postgres, avoiding the complexity of a separate vector store. In fact, pgvector is the most installed extension in Lakebase Postgres. We saw 3 common painpoints from customers running pgvector at scale.

**First, costs scale with data volume, not usage.**

pgvector keeps its index in your database's memory to be fast. Because HNSW search relies on random-access graph traversal, queries execute in milliseconds only if everything fits perfectly in RAM. The moment the index spills to disk, queries turn into chains of random reads, and performance plummets by 10x to 50x.

A 768-dimensional float32 vector requires roughly 3.3 KB of memory after accounting for graph links and Postgres overhead. at 100 million rows, you need ~330 GB of RAM to keep the index resident for millisecond queries. There's no notion of a 'working set'. You provision for the entire index whether you query all of it or none.

**Second, index maintenance is expensive and blocks your database.**

Pgvector indexes are limited by memory because the HNSW graph relies on continuous random access. When a build spills to disk, millions of random I/O operations stall performance — taking almost 50 hours to build a pgvector index on a standard cloud instance.

Ingestion suffers from the same bottleneck. Inserting new vectors is slow and costly because every write forces pgvector to navigate and modify multiple layers of the graph using random-access lookups.

Ongoing maintenance compounds the problem. Because HNSW lacks global rebalancing, restoring search quality requires a full REINDEX, which locks the table and blocks production writes.

**Third, you trade-off search quality for performance.**

Each pgvector query runs on a single Postgres backend process, meaning the HNSW index scan is never parallelized.

To get higher recall, the engine must visit more graph nodes, triggering more random memory reads and distance comparisons. This inflates latency and drops your QPS. Because a single search can't be parallelized across cores, your only option for higher throughput is adding more connections or read-replicas.

## lakebase_vector brings scalable vector search to Postgres

The main bottleneck with pgvector is that the entire index has to fit in a single machine's RAM to be fast. What if it didn't?

Lakebase Postgres gives us a great starting point, because it separates storage from compute. Durable data rests in cheap cloud object storage, while RAM and local NVMe act as ephemeral caches in front of it for fast reads of the working set of data. With this architecture, an HNSW cache means a series of random object store reads.

We need an index that is fast both when cached in RAM and when cold on object storage. We leverage two ideas:

- Hierarchical IVF clustering. Vectors are grouped into clusters stored as contiguous blocks. A query scores the cluster centroids in memory, then reads only the few promising blocks — turning hundreds of random hops into a handful of large sequential reads.
- Binary quantization (RaBitQ). Each vector is compressed to ~1 bit per dimension, about 32× smaller than float32. Queries scan the compact codes to shortlist candidates, then rerank that bounded shortlist against the full-precision vectors.

When cached, search operates over a tiny footprint using quantized vectors. When cold, queries fetch only the blocks they need and don't need to crawl the entire index.

**Pay only for what you use, and scale to zero.**

Decoupling storage from compute makes lakebase_vector completely stateless: a node caches hot data on demand, suspends to zero when idle, and resumes on the next query.

- At rest, you pay only for storage, giving you a low baseline cost for keeping vectors indexed in Lakebase.
- Cold starts are cheap because only the quantized codes and the specific blocks a query touches hydrate. Our measured P90 for the first query after scale-to-zero is just 1.13 seconds (100M × 768-dim).
- It is even possible to serve 100M vectors on just 1 Lakebase Compute Unit (CU). Only the active working dataset needs to be cached in compute nodes, giving you a pricing model that truly mirrors actual usage and query activity.

**Fast, offloaded index builds.**

lakebase_vector builds indexes in a more parallel way. We train the centroids once on a small random sample. This is the only step that looks across the whole dataset. After that, every vector is independently assigned to its nearest centroid, quantized, and written into its cluster's block. This process can fan across as many cores as you have, scaling with compute.

We take this a step further by offloading index builds from your primary database entirely. Storing data in open formats allows our LTAP architecture to delegate indexing and maintenance to distributed engines like Spark, bringing build times down to minutes with parallel compute.

**Fast, accurate search.**

lakebase_vector broadens candidate search cheaply using compact 1-bit codes, reranking only a tight shortlist at full precision. Because index blocks are independent, a single query parallelizes across CPU cores, delivering high recall and low latency simultaneously.

Filtering happens directly as lakebase_vector scans cluster blocks. Applying predicates inline avoids over-fetching candidates and keeps recall high on filtered queries.

## lakebase_text: native BM25 search in Postgres

Standard Postgres text search (tsvector) lacks corpus-wide relevance context. lakebase_text brings native BM25 to Postgres by scoring terms with global inverse document frequency (IDF): heavily weighting rare, high-intent terms while penalizing common filler words.

It is also faster than traditional tsvector + GIN indexes. By evaluating score upper-bounds during traversal, the engine skips entire posting blocks that cannot reach the top-K results.

Combining lakebase_text with lakebase_vector unlocks native hybrid search inside Postgres. In a single query, you can fuse semantic vector search with BM25 keyword relevance, apply standard SQL filter predicates, and join directly against live operational tables.

## Lakebase Postgres is built for the agentic era

Agents have pushed traditional search engines past their limits. They made vector search a core requirement of the data stack and introduced extreme burstiness, where a single workflow can trigger thousands of concurrent retrieval requests in seconds.

We designed Lakebase Search specifically for this new reality. Lakebase Postgres can now handle all your operational and search workloads, backed by a serverless architecture that scales seamlessly from 1 row to 1 billion vectors and from 1 QPS to thousands without manual reprovisioning or infrastructure management.

We built Lakebase Search alongside feedback from hundreds of beta customers, and the results speak for themselves:

1. 3x lower database spend: Conexiom cut infrastructure costs by 3x while achieving 5x higher throughput compared to pgvector.
2. One SQL tool call for agents: Developers replace complex multi-system retrieval pipelines with a single SQL call for native hybrid search, governed by standard database rules.
3. Unified OLTP and search: Teams consolidate live operational tables and dedicated search clusters into one pay-as-you-use backend.

Lakebase Search is generally available today on AWS and Azure.

Note: Databricks AI Search is a managed search engine for high-quality retrieval out of the box — it may be the better fit when you want great results without manual tuning. Lakebase Search is the better choice when you want all your operational and search data in one database.
