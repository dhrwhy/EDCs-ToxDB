-- ============================================================
-- MouseToxDB 数据完整性验证脚本
-- 导入数据后执行，检查各项指标是否符合预期
-- ============================================================

USE mousetoxdb;

-- 1. 总行数 (预期: 986)
SELECT '1. 总行数' AS test_name, COUNT(*) AS result, 986 AS expected
FROM main_records;

-- 2. 唯一 analysis_key 数 (预期: 81)
SELECT '2. 唯一 analysis_key' AS test_name, COUNT(DISTINCT analysis_key) AS result, 81 AS expected
FROM main_records;

-- 3. 唯一化学物数 (预期: 36)
SELECT '3. 唯一化学物' AS test_name, COUNT(DISTINCT chemical_id) AS result, 36 AS expected
FROM main_records;

-- 4. 唯一 DESEQ_ID 数 (预期: 78)
SELECT '4. 唯一 DESEQ_ID' AS test_name, COUNT(DISTINCT deseq_id) AS result, 78 AS expected
FROM main_records;

-- 5. 唯一 SRR_ID 数 (预期: 770)
SELECT '5. 唯一 SRR_ID' AS test_name, COUNT(DISTINCT srr_id) AS result, 770 AS expected
FROM main_records;

-- 6. 唯一 GSE_ID 数 (预期: 40)
SELECT '6. 唯一 GSE_ID' AS test_name, COUNT(DISTINCT gse_id) AS result, 40 AS expected
FROM main_records;

-- 7. 唯一 BioProject 数 (预期: 40)
SELECT '7. 唯一 BioProject' AS test_name, COUNT(DISTINCT bioproject_id) AS result, 40 AS expected
FROM main_records;

-- 8. 复用的 DESEQ_ID (应返回 3 行: DESEQ0066, DESEQ0078, DESEQ1011)
SELECT '8. 复用 DESEQ_ID' AS test_name, deseq_id, COUNT(DISTINCT analysis_key) AS key_count
FROM main_records
GROUP BY deseq_id
HAVING key_count > 1;

-- 9. 清洗验证: 不应有裸值 0
SELECT '9a. dose裸值0' AS test_name, COUNT(*) AS result, 0 AS expected
FROM main_records WHERE dose = '0';

SELECT '9b. tissue_subcategory裸值0' AS test_name, COUNT(*) AS result, 0 AS expected
FROM main_records WHERE tissue_subcategory = '0';

SELECT '9c. reproductive_subcategory裸值0' AS test_name, COUNT(*) AS result, 0 AS expected
FROM main_records WHERE reproductive_subcategory = '0';

-- 10. 资源表记录数
SELECT '10. 资源表总数' AS test_name, COUNT(*) AS result
FROM record_assets;

-- 11. 资源状态分布
SELECT '11. 资源状态' AS test_name, status, COUNT(*) AS count
FROM record_assets GROUP BY status;

-- 12. 字符集验证
SELECT '12. 字符集' AS test_name, @@character_set_database AS charset, @@collation_database AS collation;
