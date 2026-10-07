"# CarroCompraJS_v2" 

Pagina Web tipo ecommerce, carga catalogo de productos desde la APIREST hecha en Python con Django, almacenada en un Base de datos.
posee un carro de compra hecho en JavaScript, permite el ingreso y la eliminación de productos al carro de compra a su vez procesa la compra, a través de un endpoint dirigido hacia en backend con arquitectura de microservicio.

Para Ejecutarlo: se debe descargar y lo puede abrir con VCode y levantarlo con Live Server para el FrontEnd Localhost:5500
Además debe levantar Django_ApiRest_CarroCompraBack en localhost:8000, por ultimo antes de ejecutar le recuerdo que debe de migrar la Base de datos:
        python manage.py makemigrations
        python manage.py migrate

y por ultimo, recordar que para acceder al /admin debe crear el superusuario
