import pandas as pd

# Leer el CSV
df = pd.read_csv("saebn_leer.csv", sep=";")

# Filtrar: solo Total Comuna y "No"
filtro = (df["Comuna"] != "País") & (df["Sabe leer y escribir"] == "No") & (df["Comuna"] != "Total País") & (df["Sabe leer y escribir"] == "No")

# Si "Total Comuna" está en la columna Sabe leer y escribir, filtra por esa condición
# Pero según tu ejemplo, "Total Comuna" está en "Sabe leer y escribir", así que sería:
filtro = (df["Sabe leer y escribir"] == "No") & (df["Comuna"] != "País") & (df["Sabe leer y escribir"] != "Total Comuna")

# Seleccionar columnas deseadas
resultado = df.loc[filtro, ["Comuna", "5-14 años", "15-64 años", "65 años o más"]]

print(resultado) 
resultado.to_csv("saebn_leer_1.csv", index=False, sep=';')
