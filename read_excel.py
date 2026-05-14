#!/usr/bin/env python3
import pandas as pd
import sys

# 读取所有Excel文件并查看结构
files = [
    "HSE通用题库（技能）.xls",
    "仪表维修工专业题库500题（班员）.xls",
    "工艺通用题库（技能）.xls",
    "设备通用题库（技能）.xls"
]

for f in files:
    print(f"\n{'='*60}")
    print(f"文件: {f}")
    print('='*60)
    try:
        # 尝试读取Excel
        df = pd.read_excel(f)
        print(f"行数: {len(df)}, 列数: {len(df.columns)}")
        print(f"\n列名: {list(df.columns)}")
        print(f"\n前3行数据:")
        print(df.head(3).to_string())
    except Exception as e:
        print(f"错误: {e}")
