import pandas as pd

# Leer el CSV usando separador ";"
df = pd.read_csv("anos_de_educacion_por_comuna.csv", sep=";")

# Filtrar solo filas donde Sexo sea "Total Comuna"
df_total = df[df["Sexo"] == "Total Comuna"]

# Seleccionar solo las columnas necesarias
df_resultado = df_total[[
    "Comuna",
    "Anos de escolaridad promedio",
    "Anos de escolaridad promedio para la poblacion de 18 anos o mas"
]]


# Guardar nuevo CSV
df_resultado.to_csv("anos_de_educacion_por_comuna_.csv", index=False, sep=';')
