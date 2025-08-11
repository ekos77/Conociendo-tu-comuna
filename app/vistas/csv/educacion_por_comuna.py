import pandas as pd

# Leer CSV con separador ;
df = pd.read_csv("educacion_por_comuna.csv", sep=';')

# Convertir columnas numéricas quitando puntos de miles (pero conservando decimales)
for col in df.columns[1:]:
    df[col] = df[col].astype(str).str.replace('.', '', regex=False)  # quitar separadores de miles
    df[col] = pd.to_numeric(df[col], errors='coerce')  # convertir a números (int o float)

# Calcular porcentajes
df['% nunca'] = (df['Nunca asistio'] / df['Poblacion censada']) * 100
df['% profe'] = (df['Superior'] / df['Poblacion censada']) * 100

# Redondear los resultados
df['% nunca'] = df['% nunca'].round(2)
df['% profe'] = df['% profe'].round(2)

# Crear DataFrame final
resultado = df[['Comuna', '% nunca', '% profe']]

# Guardar nuevo CSV
resultado.to_csv("porcentajes_educacion.csv", index=False, sep=';')
