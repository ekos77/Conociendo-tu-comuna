import pandas as pd

# Leer primer CSV
df1 = pd.read_csv("porcentajes_educacion.csv", sep=";")

# Leer segundo CSV y convertir comas decimales a punto
df2 = pd.read_csv("anos_de_educacion_por_comuna_.csv", sep=";")
df2["Anos de escolaridad promedio"] = df2["Anos de escolaridad promedio"].str.replace(",", ".").astype(float)
df2["Anos de escolaridad promedio para la poblacion de 18 anos o mas"] = df2["Anos de escolaridad promedio para la poblacion de 18 anos o mas"].str.replace(",", ".").astype(float)

# Combinar por columna "Comuna"
df_merged = pd.merge(df1, df2, on="Comuna", how="inner")

# Mostrar resultado
print(df_merged)
# Guardar nuevo CSV
df_merged.to_csv("convinar.csv", index=False, sep=';')