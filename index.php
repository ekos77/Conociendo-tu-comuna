
<?php
    require_once "./config/app.php";
?>
<!DOCTYPE html>
<html lang="es-CL" data-bs-theme="dark" >
<head>
  <meta charset="UTF-8">
  <title>Conociendo tu comuna</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Bootstrap 5.3 -->
  <link href="<?php echo APP_URL; ?>app/vistas/css/bootstrap.min.css" rel="stylesheet">
 

  <!-- Leaflet -->
  <link rel="stylesheet" href="<?php echo APP_URL; ?>app/vistas/css/leaflet.css" />
 

  <!-- style.css personalizado -->
  <link href="<?php echo APP_URL; ?>app/vistas/css/style.css" rel="stylesheet">
 

 <link rel="stylesheet" href="//cdn.datatables.net/2.3.2/css/dataTables.dataTables.min.css">

<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

</head>
<body>


<?php
    require_once "./app/vistas/inc/navbar.php";
    require_once "./app/vistas/inc/modal.php";
    require_once "./app/vistas/inc/detalles.php";
?>
 
 
<br>
<br>

<div class="container">
  <h3 class="my-3"><i class="bi bi-speedometer"></i> Dashboard de Comunas..</h3>

  <!-- Tabs -->
  <ul class="nav nav-tabs" id="dashboardTabs" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="mapa-tab" data-bs-toggle="tab" data-bs-target="#mapa" type="button"><i class="bi bi-map-fill"></i> Mapa</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="lista-tab" data-bs-toggle="tab" data-bs-target="#lista" type="button"><i class="bi bi-list-ul"></i> Lista</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="lista-tab" data-bs-toggle="tab" data-bs-target="#portada" type="button"><i class="bi bi-person-lines-fill"></i> nosotros</button>
    </li>
  </ul>

  <!-- Contenido de Tabs -->
  <div class="tab-content" id="dashboardTabsContent">
    <!-- Mapa -->
    <div class="tab-pane fade show active" id="mapa" role="tabpanel">
      <input type="search" id="comunas-input" class="form-control mt-3" placeholder="Filtrar comunas (ej: Arica, Camarones)">
      <div class="row">
       
      <div class="col-12 col-md-5">
        <div id="map" class="mt-2"></div>
      </div>
      <div class="col-12 col-md-7">
        <table class="table">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">Comuna</th>
              <th scope="col">Educación</th>
              <th scope="col">Porcentaje</th>
              <th scope="col">Escolaridad promedio 18+</th>

            </tr>
          </thead>
          <tbody id="lateral">
 
          </tbody>
        </table>

 

        <div class="alert alert-light alert-dismissible fade show" role="alert" id="alert">
          <h4 class="alert-heading">Descripción</h4>
          <p style="text-align: justify;">
        Los datos presentados en este informe reflejan el porcentaje de personas, en relación con la población total, que nunca asistieron al colegio, así como aquellos que alcanzaron el nivel profesional. Esta información permite ofrecer un análisis comparativo tanto a nivel intra-comunal como inter-comunal. Con el fin de facilitar la comprensión y mantener la claridad, se han omitido los datos correspondientes a los niveles Diferencial, Parvularia, Básica y Media.
        <br>
        <i class="bi bi-link"></i> <a href="https://censo2024.ine.gob.cl/resultados/" target="_blank" class="alert-link">aquí</a>
          </p>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>

      </div>
      </div>
    </div>

    <!-- Lista -->
    <div class="tab-pane fade" id="lista" role="tabpanel">
      <div class="table-responsive mt-3">
        <table class="table table-striped table-bordered table-hover" id="tabla-datos">
          <thead class="table-dark">
            <tr>
              <th>Comuna</th>
              <th>Población censada</th>
              <th>Nunca asistió</th>
              <th>Diferencial</th>
              <th>Parvularia</th>
              <th>Básica</th>
              <th>Media</th>
              <th>Superior</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>


    <div class="tab-pane fade" id="portada" role="tabpanel">
      
    <div class="container my-5">
      <div class="card shadow-lg border-0 rounded-5 p-5">
        <div class="card-body">
          <h4 class="card-title text-primary fw-bold">Sobre el Proyecto</h4>
          <p class="card-text">
            Este proyecto fue desarrollado con fines académicos e informativos. La información presentada
            se obtuvo a partir de los datos del Censo 2024 realizado en Chile. Su origen responde a un interés
            particular, pero se encuentra abierto para toda la comunidad, incluyendo tanto a entidades
            públicas como privadas.
          </p>
          <p class="card-text">
            El panel informativo o dashboard fue construido utilizando diversas tecnologías para el
            procesamiento, análisis y visualización de datos, entre ellas:
          </p>
          <ul>
            <li><i class="bi bi-filetype-py"></i> Python</li>
            <li><i class="bi bi-geo-alt-fill"></i> Leaflet</li>
            <li><i class="bi bi-filetype-php"></i> PHP</li>
            <li><i class="bi bi-filetype-html"></i> HTML</li>
            <li><i class="bi bi-filetype-js"></i> JavaScript</li>
            <li><i class="bi bi-bootstrap"></i> Bootstrap</li>
            <li>Entre otras herramientas complementarias</li>
          </ul>
          <h5 class="text-secondary mt-4">Acerca del Desarrollador</h5>
          <p class="card-text">
            Este proyecto también se presenta como una carta de presentación, con el objetivo de
            mostrar las capacidades y conocimientos técnicos que poseo, en caso de ser de interés
            para colaboraciones o propuestas profesionales.
          </p>
          <h6 class="fw-bold">Contacto</h6>
          <ul class="list-unstyled mb-0">
            <li><strong><i class="bi bi-envelope-at-fill"></i></strong> ejemplo@email.com</li>
            <li><strong><i class="bi bi-telephone-fill"></i></strong> +56 9 7845 1289</li>
            <li><strong><i class="bi bi-github"></i></strong> <a href="https://github.com/ekos77" target="_blank">github.com/ekos77</a></li>
          </ul>
        </div>
      </div>
    </div>

    </div>
  </div>
</div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script src="//cdn.datatables.net/2.3.2/js/dataTables.min.js"></script>
  <script src="<?php echo APP_URL; ?>app/vistas/js/bootstrap.bundle.min.js"></script>
  <script src="<?php echo APP_URL; ?>app/vistas/js/leaflet.js"></script>
  <script src="<?php echo APP_URL; ?>app/vistas/js/main.js"></script>


</body>
</html>
