import pandas as pd

# Cargar CSVs
df1 = pd.read_csv("convinar.csv", sep=";")
df2 = pd.read_csv("saebn_leer_1.csv", sep=";")

# Renombrar columnas del segundo CSV
df2 = df2.rename(columns={
    "5-14+": "edad_5_14",
    "15-64+": "edad_15_64",
    "65+": "edad_65_mas"
})

# Unir por 'Comuna'
df_final = pd.merge(df1, df2, on="Comuna", how="inner")

# Guardar resultado
df_final.to_csv("combinado_11.csv", sep=";", index=False)

print(df_final)
