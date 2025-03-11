import { Request, Response} from 'express';
import fs from 'fs/promises';
import { Document,
         OpenAI,
         VectorStoreIndex,
         serviceContextFromDefaults,
         SimpleNodeParser,
         RelevancyEvaluator,
         storageContextFromDefaults
        } from 'llamaindex';

require('dotenv').config()

export const queryEngineController = async (req: Request, res: Response) => {

    const query = req.body.query;
    const prompt = `Resuelve la preguntas ${query}, basate en la informacion proporcionada`
    
    // recuperar los blobs de los documentos
    
    const training = `
    Eres un chatbot, resuelve la pregunta del cliente, apartir de la siguiente información:
    Código de ética CompuSoluciones.
    Sujetos y Objetivos del Código
    El presente Código está dirigido a los colaboradores que brindan servicio a la compañía
    CompuSoluciones. Asimismo, también está dirigido a los miembros del consejo de administración
    de cada una de las empresas que integran a CompuSoluciones.
    El objetivo del Código de Ética y Conducta o de Buen Gobierno es compartir los valores éticos
    definiendo las conductas a seguir para accionistas, miembros del consejo de administración
    (“consejeros”) colaboradores, clientes y proveedores.
    El Código promueve altos estándares para asegurar una conducta ética y profesional, a fin de
    preservar la integridad y confiabilidad de CompuSoluciones, asegurar el cumplimiento de las leyes
    y proteger los intereses de los clientes y accionistas, a la vez que se establece un ambiente de
    trabajo justo y equitativo para todos los colaboradores.
    El cumplimiento del presente Código es obligatorio para los consejeros y todos los colaboradores.
    Es responsabilidad de todos ellos observar y hacer observar todas las conductas descritas en éste.
    Desarrollo de Talento y Dirección de CompuSoluciones son quienes disponen de esquemas y
    sistemas de vigilancia, como Auditoría Interna, y están facultados para aplicar las sanciones a las
    conductas violatorias en los términos propuestos por el Comité de Ética de CompuSoluciones.
    Todos los colaboradores deben certificarse en la comprensión del Código en un plazo de 30 días
    naturales siguientes a partir de la fecha de contratación y recertificarse anualmente dentro de los
    30 días posteriores a la fecha que Desarrollo de Talento designe, renovando su compromiso con la
    vivencia y protección de nuestra Filosofía.
    1.1 Nuestro actuar en CompuSoluciones
    Una de nuestras grandes responsabilidades es preservar la confianza que nuestros clientes,
    proveedores, autoridades y accionistas han depositado en nosotros, para lograr la aportación de
    valor como empresa. Por ello, debemos esforzarnos por actuar siempre apegados a los Valores y
    Normas de conducta que nos marca el presente Código.
    1.2 Nuestra Filosofía
    Es nuestra forma de pensar y actuar:
    • Se compone de Propósito y Valores
    • El Código de ética y conducta es el medio de regulación, que sirve para comunicar nuestra
    Filosofía y Valores.
    • La protegemos contando con Medios de reporte.
    1.3 Propósito
    Nuestro Código ha sido diseñado para satisfacer o exceder los requisitos legales y de cumplimiento
    actualmente vigentes.
    El Código de conducta ha sido diseñado para ayudarnos a alinear nuestras acciones y decisiones
    con nuestros valores clave y con los requisitos de cumplimiento, mientras procuramos cumplir la
    misión de CompuSoluciones. Tiene la intención de ayudarnos a reconocer los conflictos de ética y
    cumplimiento antes de que surjan y a tratar adecuadamente los conflictos que se presenten. El
    Código no tiene la intención de ser un compendio de políticas ni una lista exhaustiva de los
    requisitos legales y de cumplimiento. Contamos con muchas políticas que influyen en nuestro
    trabajo, y el colaborador debe conocer las que lo afectan personalmente. El Código tiene la
    intención de establecer el tono de cómo trabajamos en CompuSoluciones. Es más que palabras
    impresas en papel, refleja cómo hacemos negocios.
    1.4 Valores
    Nuestro Código de ética representa y refuerza nuestro compromiso hacia la integridad, y nos ayuda
    a resolver temas relacionados con la ética y el cumplimiento conforme a nuestros valores clave.
    Nuestros valores clave son un conjunto de principios que no son negociables. Han marcado nuestro
    camino durante más de 30 años. Son parte de nuestro legado y de nuestro futuro. Conectarse con
    nuestros valores clave es una responsabilidad compartida.
    • Productividad: Logramos más y mejor con menos
    • Integridad: Somos transparentes y honestos
    • Confianza: Generamos certidumbre en todas nuestras interacciones
    • Servicio: Transformamos clientes en nuestros promotores
    • Equipo: Colaboramos con entrega y compañerismo
    • Lealtad: Construimos relaciones ganar-ganar
    • Innovación: Creamos soluciones que agregan valor
    1.5 Prácticas
    Talento y disposición para integrar pequeñas piezas y la maestría para encontrar patrones
    (metodologías y procesos de interrelación) que ensamblen perfectamente, a fin de atender todos
    los aspectos de la cultura corporativa y la interrelación con los mercados de nuestros clientes.
    1.6 Política de Transparencia
    La empresa se compromete a mantener informados a sus colaboradores sobre los asuntos
    relevantes y cambios importantes que les afecten, buscando que siempre sean tratados en un
    ambiente de trabajo libre de intimidación, hostigamiento, violencia, discriminación, acoso laboral
    y en defensa de los derechos humanos sin importar el nivel, responsabilidad o género. Esto, tiene
    como responsabilidad el observar las medidas para prevenir el uso indebido de la información
    explicado en el apartado de Corrupción
    I Conductas con
    Respecto a
    CompuSoluciones I
    Conductas con Respecto a CompuSoluciones
    2.1 Conflicto de Interés:
    El conflicto de interés se presenta cuando inferimos en las decisiones de negocio en aras de
    beneficiar o estrechar relaciones comerciales con terceros anteponiendo beneficios propios o del
    tercero antes que el beneficio de mantener relaciones ganar-ganar de CompuSoluciones con los
    terceros.
    Para evitar que un conflicto de interés se presente en tu quehacer diario, sin importar el puesto
    que desempeñes, el código invita a vivir las siguientes conductas:
    • Vive los valores CompuSoluciones, poniendo especial énfasis en los valores de integridad,
    confianza y lealtad en todas tus decisiones.
    • La reputación de la empresa en el mercado depende de que te mantengas atento a identificar
    conflictos de interés, en esos casos mantente al margen y permite que alguien más evalúe la
    situación y se pueda dar un verdadero valor en toda relación comercial en la que se vincule
    CompuSoluciones.
    • Si un familiar o amistad es parte de la cadena de asociados y clientes y/o proveedores, es
    recomendable que evites gestionar esa relación comercial, evita un conflicto de interés, y
    permite que un tercero la gestione.
    • Con respecto a los regalos en bienes o servicios que se reciban de terceras personas con las
    que se tenga una relación de negocios, se procede de acuerdo con el valor del bien recibido. 1)
    Si el bien fuera de alto valor (más de 300 dólares), se debe regresar a quien lo regaló, con
    mayor razón si se está en un proceso de decisión que pudiera beneficiarlo. 2) Si el bien fuera
    un libro o un promocional de la empresa de bajo valor, el destinatario lo puede conservar. 3)
    En los demás casos, se puede destinar para uso interno de la compañía, si es de utilidad, o se
    entrega a Conecta para revisar si se usa internamente o se aplica para beneficio de las causas
    sociales. Conecta, a su vez, analiza si los destina a sus causas o si realiza una subasta entre
    colaboradores para generar fondos para los proyectos.
    • Nuestra cadena de asociados y clientes se ha visto fortalecida gracias a las prácticas de negocio
    que se han desarrollado de aplicación general, no rompas esas prácticas tratando de agradar
    a cierto cliente, los acuerdos que realices con ellos deben de ser tan transparentes como si se
    fueran a hacer públicos en todo momento.
    • No aceptes brindar apoyos o ayudas en especie o económicos, a nombre de CompuSoluciones
    de manera particular y a título personal a ningún tercero relacionado o por relacionarte
    • No comprometas tu palabra cuando no has analizado a fondo el beneficio de la relación
    comercial con los terceros, es mejor utilizar tu sentido común y esperar a evaluar los hechos
    antes de comprometer tu palabra.
    • No veas a tu empresa como una empresa que debe de beneficiar a terceros por el simple hecho
    de que tu colabores en ella, toda relación comercial debe tener un sentido de negocio para
    ambas partes.
    • La lealtad de los colaboradores debe de estar para CompuSoluciones y no hacia ti, no les
    generes conflictos de interés en sus relaciones como colaboradores hacia contigo, por lo que
    no te prestes como solucionador de sus problemas económicos, o dando permisos a tu
    discreción, etc., apégate a las políticas de desarrollo de talento para tener un trato equitativo
    con el resto de los colaboradores y sus facilitadores asegurando el mantener siempre una
    relación institucional con el colaborador sin importar quien sea su facilitador
    • Apégate en su caso, a la política de un segundo empleo para evitar colocarte en un conflicto de
    interés por tratar de utilizar tiempos laborales en CompuSoluciones a favor de un tercero.
    • Los directivos y Gerencias deben de vigilar no caer en un posible conflicto de interés cuando
    por el acceso a la información que poseen pudieran obtener un beneficio personal de entre
    otras cosas: cooperar con el fabricante a lograr su cuota con el beneficio de mayores apoyos a
    futuro personales o de posicionamiento, contar con gastos de viaje pagados como expositor
    derivado del conocimiento de información privilegiada, recibir membresías gratis por compartir
    en un medio de prensa información a su alcance, entre otros. En estos casos es importante
    anteponer a la autorización de estas decisiones a la Dirección General o al consejo con los
    beneficios que se pueden alcanzar para evitar una decisión sesgada por el conflicto de interés.
    2.2 Política de Empleo Ajeno y Otras Actividades
    El reto de cada puesto requiere de todo el potencial y atención del colaborador, lo cual es imposible
    de alcanzar si se tuviera otra actividad, es por esto por lo que CompuSoluciones restringe todo
    empleo externo, excepto:
    • Las personas de niveles no profesionistas pueden tener un segundo empleo cuando este no
    interfiera con su horario laboral y no limite la disponibilidad para extender su horario de trabajo
    cuando sea necesario.
    • Los profesionistas solo pueden tener como segundo empleo la docencia siempre y cuando el
    puesto lo permita, se tenga una autorización del facilitador y el servicio al cliente no se vea
    afectado (de ser necesario reponer horas de trabajo, esto debe realizarse dentro de la misma
    semana en la que se da clase).
    • No se considera como segundo empleo aquellos hobbies que se realicen que no lleven más de
    4 horas semanales, en donde la remuneración no sea recurrente, ni represente más del 15%
    del sueldo nominal del colaborador. Estos deben estar comunicados a Desarrollo de Talento
    por escrito copiando al facilitador y director del área.
    • Si en el trayecto hacia la oficina o de regreso a casa se quiere trabajar en alguna plataforma de
    servicio de taxi (no aplicable en vehículos propiedad de la empresa), para distribuir los gastos
    de viaje, puede hacerse y no está considerado como segundo empleo. Esto no debe afectar el
    horario en la compañía, pues llevar a cabo esto no exime de cubrir en tiempo el horario de
    ingreso.
    2.3 Actividades de Voluntariado
    CompuSoluciones apoya fuertemente las actividades de voluntariado en organizaciones
    comunitarias y de beneficencia, sin embargo, hay muchas situaciones en que el voluntariado
    presenta las mismas posibilidades de que se produzcan lealtades divididas, que la participación en
    negocios o trabajos retribuidos. Los servicios como voluntario deben realizarse en general en el
    tiempo libre y por tu propia cuenta, pero el hecho de que este servicio no sea retribuido no significa
    que no surjan conflictos. Dentro de los conflictos de intereses prohibidos dentro del voluntariado
    se incluyen los siguientes:
    1. No debes participar en decisiones de CompuSoluciones relativas a una organización de
    beneficencia o de otro tipo en la que seas partícipe como voluntario en tu tiempo libre y/o
    apoyar los intereses de esa organización, a menos de que lo hagas público con todas las partes
    interesadas.
    2. Sin la aprobación de Dirección, no puedes autorizar el uso del nombre o activos de
    CompuSoluciones por una organización de beneficencia o voluntariado.
    3. No puedes hacer peticiones a otros en las instalaciones de CompuSoluciones o en horas de
    trabajo, actuando en nombre de una organización de beneficencia o voluntariado, cuando no
    exista un acuerdo con Conecta.
    2.4 Uso de activos.
    El colaborador de CompuSoluciones puede utilizar su equipo de cómputo, equipo de transporte
    ejecutivo y/o herramientas para actividades personales no lucrativas, es importante recordar que
    son propiedad de CompuSoluciones y por lo tanto deben ser utilizados prioritariamente para fines
    laborales y tratados con propiedad, sin maltratos ni desperdicios que ocasionen gastos
    innecesarios. Las actividades laborales deben ser desarrolladas única y exclusivamente con equipos
    de cómputo propiedad de CompuSoluciones, ya que éstas son las herramientas de trabajo
    asignadas para dicho fin, por lo tanto, se prohíbe el uso de equipos personales para desarrollar
    actividades laborales y/o el uso de perfiles adicionales en el equipo corporativo.
    Por productividad CompuSoluciones define entregar tarjetas corporativas y/o de carga de gasolina
    para uso exclusivo del activo asignado; en el caso de uso de equipos de cómputo, se puede utilizar
    de forma ocasional para enviar mensajes personales o para acceder a materiales en Internet que
    no están relacionados directamente con el trabajo, aunque estos usos personales deben
    minimizarse dentro de las horas de trabajo y no prestarlos a terceros familiares sin estar bajo
    nuestra supervisión. Apégate a la política de uso de activos y medios de información y donde aplique
    debes de contar con su certificación.
    De la misma forma, se debe respetar los elementos de trabajo de los otros colaboradores, evitando
    tomarlos o usarlos sin el consentimiento de ellos. Se prohíbe el acceso y distribución de fotografías
    y objetos pornográficos, o información e imágenes que atenten contra la moral y las buenas
    costumbres, así como queda prohibido las cartas en cadena y los materiales amenazantes,
    políticos, fraudulentos, discriminatorios, de contenido sexual o que supongan un acoso para otras
    personas. En todo momento se deben de utilizar bajo nuestra cultura de valores.
    En el caso de herramientas de comunicación interna, se puede hacer uso con fines de ventas de
    productos propios tales como autos, muebles, etc., de manera ocasional y siempre en el entendido
    de que las condiciones y estado de estas, en ningún caso son avaladas por CompuSoluciones. En
    la vivencia del valor de la Confianza, el código te limita a instalar en los equipos de cómputo,
    software que no siga las políticas y procedimientos del área de TI, si tuvieras alguna duda acude a
    registrar un reporte de Help Desk.
    El área de Sistemas de CompuSoluciones publica con frecuencia normas y políticas que promueven
    la seguridad y el uso adecuado de los sistemas electrónicos de CompuSoluciones. Debes conocer
    las políticas y cumplirlas en su totalidad. Éstas ofrecen indicaciones sobre el uso de los sistemas y
    recursos de CompuSoluciones, tales como, claves de acceso, correo electrónico, sistema de buzón
    de voz e Internet. Si tienes alguna duda contacta con el personal local del departamento de
    Sistemas para asistencia.
    Dado que los sistemas informáticos y de comunicación, escritorios, archiveros, armarios y demás
    equipos son propiedad de la compañía, o están siendo arrendados por la compañía para efectos
    de operación del centro de trabajo (entendiéndose como centro de trabajo las oficinas de la
    compañía o los domicilios en donde los colaboradores presten sus servicios en la modalidad de
    Teletrabajo), CompuSoluciones puede acceder a cualquiera de dichos recursos en cualquier
    momento. Si bien como colaborador, se te permite utilizar estos activos ocasionalmente para fines
    personales, los mismos continúan siendo propiedad de la compañía, y están sujetos al control,
    incluso en caso de estar protegidos con cerraduras, claves de acceso o dispositivos similares. No
    se debe esperar privacidad personal en relación con cualquiera de las propiedades de la empresa,
    incluyendo correo electrónico, buzón de voz y registros informáticos almacenados en los equipos
    de CompuSoluciones.
    El mal uso de los activos de CompuSoluciones es una infracción laboral y puede dar lugar a la
    terminación de contrato de trabajo.
    2.5 Prácticas de Gestión y Contabilidad
    En concordancia con el valor de la Integridad, se debe cumplir con las normas de información
    financiera aplicables en México y en Colombia, según sea el caso, y ejecutar todas las transacciones
    de acuerdo con las políticas y procedimientos aprobadas por CompuSoluciones. En ningún caso
    realices asientos contables falsos o dudosos en los libros o archivos de CompuSoluciones.
    Para tener acceso a los fondos o activos de CompuSoluciones se debe estar autorizado, por lo
    tanto, es importante seguir las políticas de accesos a sistemas (códigos de acceso a sistemas
    bancarios, accesos en el sistema administrativo, etc.). Estas normas tienen por objeto no sólo
    proteger a CompuSoluciones frente a prácticas corruptas o fraudes dentro de la compañía, sino
    también asegurar que los recursos de CompuSoluciones nunca se utilizan para fines corruptos
    fuera de la compañía.
    No hacer ningún registro o pago a nombre de CompuSoluciones, cualquiera que sea la forma que
    adopte, sin contar con la adecuada documentación que lo soporte, o por cualquier motivo distinto
    del que aparece descrito en dicha documentación.
    2.6 Compensaciones a terceros o regalos con cargo a CompuSoluciones.
    Gestión de bonos a terceros: Los acuerdos sobre bonos o comisiones se efectúan solamente bajo
    contratos establecidos por escrito con los distribuidores, actuando bajo el principio de la buena fe.
    Cualquier bono o comisión en la obtención de pedidos debe ser razonable y consistente con los
    procedimientos y las prácticas comúnmente aceptadas en la industria, así como con los productos
    de que se trate y los servicios a prestar.
    CompuSoluciones prohíbe estrictamente el pago de comisiones o cualquier otro tipo de
    compensación a colaboradores o representantes de clientes o de proveedores, o a los socios o
    familiares de cualquiera de estos grupos de interés. Existe una excepción en el caso de programas
    de incentivos públicamente anunciados y aprobados por un director de CompuSoluciones, o por la
    persona que éste designe.
    Los objetos de propaganda, atenciones de esparcimiento, pueden entregarse a nombre de
    CompuSoluciones a los colaboradores y representante de clientes y proveedores, únicamente si:
    • Cuentan con la autorización de Dirección General y de marketing.
    • Son consistentes con los usos y costumbres comerciales y las normas éticas generalmente
    aceptadas.
    • No pueden interpretarse como soborno o contraprestación debido a su costo, la frecuencia de
    su entrega u otras circunstancias. Por ejemplo, comidas de negocios que pudieran resultar
    apropiadas en caso de que CompuSoluciones las realizase una o dos veces con sus clientes
    actuales o potenciales para fomentar la marcha de la relación, pueden resultar inadecuadas en
    caso de realizarse con mayor frecuencia.
    • No infringen ninguna ley, disposición gubernamental o política, incluyendo cualesquiera
    políticas internas del cliente o proveedor.
    • La revelación pública de los hechos no resulte perjudicial para el prestigio de CompuSoluciones.
    • Queda prohibido realizar pagos a funcionarios públicos, cuando estos puedan ser entendidos
    como un soborno o intento de influir en el comportamiento de las autoridades. No debes llevar
    a cabo ningún acuerdo que incluya honorarios en las que un miembro del gobierno o funcionario
    tenga intereses particulares, a menos que lo permita la ley, y siempre que se cuente con la
    previa autorización escrita de Dirección General. Los pagos no se realizan en efectivo.
    2.7 Manejo de información.
    Para facilitar el uso de la información, CompuSoluciones la ha clasificado como:
    • Privilegiada: No se comparte y es información que solo puede ser accedida por grupos
    específicos de colaboradores o personas autorizadas que requieren del conocimiento de esa
    información, ejemplo, información de tenencia accionaria, carpetas de auditoría interna o
    externa, carpetas de uso restringido del área de desarrollo de talento y de Contabilidad etc.
    • Confidencial: No se comparte la información. Es toda la información contenida en el sistema
    administrativo, CRM y formas electrónicas
    • De uso interno: Solo se comparte con colaboradores. Es la información contenida en la Intranet
    a excepción de información legal que permita el acceso a colaboradores para compartirse con
    clientes, proveedores o terceros interesados, ejemplo: Copias de poderes, documentos fiscales
    como opiniones, etc.
    • Pública: Se puede compartir públicamente. Es la información publicada en el sitio web de
    CompuSoluciones.
    Es obligatorio tratar como confidencial toda la información de CompuSoluciones, de sus consejeros,
    accionistas, colaboradores, clientes, distribuidores, acreedores y proveedores, comprometiéndose
    a salvaguardarla de aquellos que no estén legalmente autorizados a conocerla.
    Para proteger la información, CompuSoluciones cuenta con política de seguridad de la información,
    para fortalecer el cuidado de esta política debes de contar con la certificación anual. Así mismo se
    debe incluir en los contratos legales con terceros la cláusula de confidencialidad para ayudar a
    proteger la información.
    Para evitar el uso indebido de la información CompuSoluciones te pide que te apegues al menos
    en las siguientes prácticas de cuidado y control de la información:
    • Abstenerse de hacer declaraciones a nombre de CompuSoluciones ante cualquier medio de
    comunicación sin previa autorización de Dirección de Marketing y de la Dirección General de
    CompuSoluciones.
    • No puedes vender, divulgar o transmitir por ningún medio listados de correspondencia, datos
    de mercadotecnia o tipos similares de información vinculada con los clientes, exclientes,
    prospectos, colaboradores, excolaboradores, consejeros, accionistas, candidatos, prestadores
    y ex prestadores de servicios o distribuidores.
    • Eres responsable de la confidencialidad, del uso de tu clave de usuario (user ID) y de tu clave
    de acceso (password) para operar en los sistemas. No la compartas ni a internos, ni a externos.
    • No debes realizar operaciones en beneficio propio, por sí mismo o de terceras personas,
    utilizando información interna de CompuSoluciones y de sus clientes, proveedores o
    prestadores de CompuSoluciones.
    2.8 Medidas para prevenir el uso indebido de la información
    Confidencialidad de la información disponible.
    Se entiende por información confidencial, aquella que, al ser dada a conocer a terceros no
    autorizados, a través de consejeros y colaboradores, pueden tener un impacto negativo hacia el
    CompuSoluciones, sus clientes o hacia los propios colaboradores.
    Se considera información confidencial independientemente del medio en que se encuentre, ya sea
    en forma electrónica, impresa o cualquier otro (la siguiente lista es de carácter enunciativo, más
    no limitativo):
    • Información de las operaciones financieras o comerciales de los clientes y distribuidores.
    • Datos personales, financieros, comerciales y sensibles de los distribuidores y consejeros.
    • Datos personales, financieros, comerciales y sensibles de los clientes, exclientes y prospectos.
    • Datos personales, financieros y sensibles de los colaboradores, excolaboradores y candidatos.
    • Datos personales y financieros de los prestadores y ex prestadores de servicios de
    CompuSoluciones.
    • Datos, desarrollos, metodologías y especificaciones de productos y servicios, planes y
    estrategias de comercialización.
    • Técnicas, métodos, procesos y sistemas de tecnología de CompuSoluciones.
    • Productos de software propiedad de CompuSoluciones o con licencias de uso.
    • Políticas de compensación y tabuladores de sueldo.
    Los consejeros y colaboradores de CompuSoluciones se conducen de acuerdo con los siguientes
    lineamientos:
    • Guardar la información confidencial por medio de los mecanismos apropiados de seguridad
    que eviten su divulgación y mal uso.
    • El responsable de las áreas de trabajo donde se realizan operaciones y/o actividades
    administrativas, debe tomar medidas para proteger la información confidencial en
    circunstancias en que haya visitantes presentes.
    • Las visitas a las áreas de trabajo por parte de externos (personas que no laboran en
    CompuSoluciones) deben ser requeridas previamente y estar autorizadas por el encargado del
    área a visitar. Durante todo el recorrido los visitantes son acompañados por el responsable que
    solicita dicha visita, siendo este último responsable de las actividades que realicen dichas
    personas externas.
    • Está prohibido a los visitantes utilizar equipos con capacidades de audio grabación y
    videograbación mientras se encuentren visitando las diferentes instalaciones de
    CompuSoluciones, a menos que exista una autorización en contrato.
    • No dejar información o documentación confidencial al alcance de terceras personas, ni
    comentar su existencia a personas no autorizadas.
    • Proporcionar la información de clientes únicamente cuando exista requerimiento expreso,
    fundado y motivado por las autoridades competentes.
    • No utilizar, divulgar o brindar información confidencial de CompuSoluciones para obtener un
    beneficio propio o de cualquier tercero.
    De manera general estos lineamientos incluyen:
    • Firmar un convenio de confidencialidad y privacidad.
    • Incluir en los contratos de prestación de servicios cláusulas de confidencialidad de la
    información y de protección de datos personales.
    2.9 Corrupción
    La corrupción es una falta grave en cualquier ámbito y bajo cualquier circunstancia. La rechazamos
    con el ánimo de seguir manteniendo firme la confianza de todos los que nos rodean, ya que no
    basta la transparencia en nuestras relaciones con los demás, sino la constante lucha en contra de
    la corrupción en todas sus formas.
    Está prohibido:
    • Distorsionar, alterar, falsificar o manipular los registros y/o la información contable, o bien
    falsear las operaciones y/o información, en cualquier caso. Se entiende como falsear las
    operaciones, el reporte de operaciones ficticias, conocido con el nombre de fraude, sobre
    ventas, devoluciones de ventas, notas de crédito, préstamos, créditos, seguros, compras y
    gastos.
    • Realizar acciones que puedan influir, ejercer coerción, manipular o engañar a cualquier auditor
    interno o externo, consejeros o colaboradores que se encuentren en el desempeño de sus
    funciones.
    • Sobornar o dejarse sobornar con dádivas u otra manera para alterar o aparentar una verdad.
    • Alterar o falsificar información relativa a indicadores de desempeño.
    • Expedir o firmar cartas de recomendación a nombre de CompuSoluciones sin tener esa
    responsabilidad en tu puesto.
    • Contribuir a que se realicen a través de CompuSoluciones operaciones con recursos de probable
    procedencia ilícita.
    • Alterar o falsificar cualquier documento.
    • Falsificar firmas y/o firmar por un cliente en los documentos de las solicitudes de crédito,
    contratos o cualquier otro documento. Se considera falsificación el hecho de firmar por terceras
    personas.
    • Solicitar u obligar a colocar créditos con prestanombres o fuera de políticas.
    • Favorecer a un cliente sobre otro.
    • Aceptar fondos fabricante etiquetados donde no se vea el beneficio para CompuSoluciones.
    • Hacer mal uso de los beneficios de los programas “AROS” y “Ahorro ConSentido”
    • Mantener operaciones con Asociados/OES, cuando en el informe de aprobación de líneas de
    crédito, el sistema reporte que identifica que tiene facturas vinculadas con la lista negra del
    SAT (México), DIAN (Colombia), lista Clinton (EUA)
    Para más información consulta la Política de Anticorrupción
    I Conductas con
    Respecto a los
    Colaboradores I
    Conductas con Respecto a los Colaboradores
    3.1 Obligaciones de los colaboradores
    Se espera de ti, el cumplimiento de la jornada laboral y regular tus labores diarias. Sin embargo,
    reconocemos que, bajo ciertas circunstancias, las personas necesitan ausentarse de sus labores
    por diversas razones que pueden incluir: enfermedades, accidentes, incapacidades médicas
    personales o de dependientes menores de edad, fallecimiento de familiares, o bien permisos
    especiales de ausentarse con o sin goce de sueldo.
    En el tema de ausencia, se hace distinción en cada una de ellas; si ha sido una ausencia autorizada
    o una ausencia no autorizada. Por ello se han emitido los procedimientos de control de asistencia
    de los colaboradores y de los permisos de ausencia, establecidos en el contrato individual de
    trabajo, Reglamento Interior de Trabajo, Política de Teletrabajo y la Política de Prestaciones y
    Beneficios, a los que puede remitirse el colaborador para cumplir con su obligación de apego y
    cumplimiento de su jornada laboral.
    Adicional se te pide que cumplas con:
    Apego legal:
    • Abstenerse de dar instrucciones a colaboradores, proveedores o clientes, que sean contrarias
    a las políticas y procedimientos establecidos o que sean contrarias a las leyes y disposiciones
    vigentes.
    • Proporcionar a las personas que tomen decisiones, información legalmente disponible y que
    sea de importancia para que puedan realizar sus funciones en el mejor interés de
    CompuSoluciones.
    • Hacer del conocimiento de todas las contrapartes (colaborador, proveedor y cliente) las
    políticas internas relacionadas con los productos y servicios prestados.
    • Registrar en la contabilidad y en los sistemas todas las operaciones financieras que realices,
    conforme a los procedimientos establecidos para tal efecto, y sujetos a revisión por parte del
    Auditor interno, del Auditor externo y/o del Revisor Fiscal.
    • Tomar y aprobar los programas de capacitación que se impartan respecto a la cultura
    CompuSoluciones, así como las disposiciones relativas a la prevención y detección de
    operaciones con recursos de procedencia ilícita.
    • Reportar todas aquellas actividades referentes a nuestros tratamientos y vulneración de datos
    personales, financieros, sensibles para su adecuado tratamiento y cumplir con las disposiciones
    relativas a la Protección de Datos Personales.
    Cultura CompuSoluciones:
    • Cuando tengas colaboradores bajo tu responsabilidad, supervisar que realicen sus actividades
    conforme a las políticas y procedimientos establecidos con apego al régimen legal. Y en su
    caso, recopilar y contar con elementos necesarios que sustenten la terminación laboral de tus
    supervisados.
    • Informar y, de ser posible, aportar evidencia de las violaciones e irregularidades de las que
    tengas conocimiento al siguiente nivel de supervisión, o bien a través de los Medios de reporte
    institucionales para su determinación y sanción.
    • Cuidar que la atención, el trato y las palabras hacia los demás no se confundan con caricias y
    familiaridades que no corresponden al lugar, ni a la relación profesional entre colaboradores.
    3.2 Prohibiciones para los colaboradores
    • Utilizar recursos materiales o económicos a su nombre para contribuciones y/o apoyo a
    partidos políticos, instituciones públicas o privadas, o a cualquier otro organismo o entidad y/o
    para beneficio propio.
    • No cumplir con todas y cada una de las políticas, procesos, procedimientos y metodología de
    CompuSoluciones.
    • Establecer sanciones económicas a colaboradores que no obedezcan las políticas y
    procedimientos establecidos.
    • Evitar relaciones sentimentales que impliquen infidelidades.
    • Alterar o falsificar cualquier documento.
    • Establecer relaciones de complicidad con los clientes/proveedores/colaboradores, que puedan
    ser perjudiciales para CompuSoluciones.
    3.3 Ambiente laboral
    Soy responsable de crear y mantener un clima de confianza y respeto mutuo que permita el libre
    intercambio de ideas y propicie la plena realización de los consejeros y colaboradores en su trabajo.
    En CompuSoluciones no se discrimina con base en la raza, religión, sexo, edad, nacionalidad,
    estado civil, estado de salud, capacidades diferentes o preferencia sexual de cualquier persona, en
    lo que se refiere a la designación de consejeros o con relación al reclutamiento, contratación,
    entrenamiento, promoción, retribución, beneficios, sanciones y otros términos y condiciones de
    empleo. En consecuencia, todas las decisiones y acciones relacionadas a la designación y al empleo
    (contrataciones y promociones) se basan en evaluaciones válidas conforme a las políticas internas
    que muestren si la persona está calificada y es apta para desempeñar el cargo o puesto.
    Está prohibido:
    • Consumir, distribuir, transportar, vender y poseer cualquier tipo de droga o sustancia prohibida
    para la salud.
    • Consumir bebidas alcohólicas dentro de las instalaciones, a excepción de los eventos y festejos
    institucionales, y evitando en ellos, el abuso de dichas bebidas.
    • Fumar dentro de las instalaciones de CompuSoluciones
    • Ofrecer promociones y aumento sin sustento.
    • Favorecer a determinados colaboradores asignando tareas preferentes, o permitiéndoles
    conductas o ventajas especiales, así como asignar funciones basadas en el menosprecio de un
    colaborador
    • Dirigirme a cualquier colaborador con palabras altisonantes u ofensivas (ni en forma de broma),
    con gritos, de forma agresiva, humillante o con violencia física. No existe ninguna justificación
    para hacerlo. Así como realizar actos contra la integridad física o moral, la libertad física o
    sexual y los bienes de quien se desempeñe como colaborador; toda expresión verbal injuriosa
    o ultrajante que lesione la integridad moral o los derechos a la intimidad y al buen nombre de
    los colaboradores, así como todo comportamiento tendiente a menoscabar la autoestima y la
    dignidad de un colaborador.
    • Condicionar u obligar a los colaboradores a participar en eventos extralaborales, así como
    actividades de voluntariado, rifas, etc.
    • Negar el derecho de vacaciones a colaboradores sin justificación alguna.
    • Realizar o ejecutar actos de trato diferenciado por razones de la condición social, cultural, raza,
    género, origen familiar o nacional, credo religioso, preferencia política o de cualquier otra
    índole, que carezca de razonabilidad desde el punto de vista laboral.
    • Debo abstenerme de la crítica y la burla hacia otro consejero o colaborador, ya que puede
    afectar negativamente su dignidad y el desempeño en el trabajo.
    • Realizar conductas cuyas características de reiteración o evidente arbitrariedad permitan inferir
    el propósito de inducir la renuncia del empleado o trabajador.
    • Obstaculizar el cumplimiento de la labor o hacerla más gravosa o retardarla con perjuicio para
    el colaborador. Constituyen acciones de entorpecimiento laboral, entre otras, la privación,
    ocultación o inutilización de los insumos, documentos o instrumentos para la labor, la
    destrucción o pérdida de información, el ocultamiento de correspondencia o mensajes
    electrónicos.
    • Realizar conductas tendientes a poner en riesgo la integridad y la seguridad del colaborador
    mediante órdenes o asignación de funciones sin el cumplimiento de los requisitos mínimos de
    protección y seguridad para el colaborador.
    • Acoso: No permito el hostigamiento de cualquier índole, mis acciones o palabras no deben de
    violentar la dignidad y respeto de consejeros, colaboradores, clientes o proveedores. Por lo que
    debo evitar el:
    o Hacer uso implícito o explícito de mi autoridad para que un colaborador realice o
    encubra actividades que violen las políticas, así como lo establecido en el Código.
    o Intimidar o tomar represalias con colaboradores que hagan uso de los Medios de reporte
    institucionales o contesten encuestas de opinión sobre el clima laboral de su área u
    oficina.
    o Ejercer presión sobre colaboradores, clientes, proveedores, consejeros o accionistas
    para que mencionen si han hecho uso de los Medios de reporte.
    • Acoso sexual hacia cualquier persona, colaborador, cliente, proveedor, consejero o accionista,
    por el daño moral que causa a quienes lo experimentan y por el efecto nocivo que pueda tener
    para la reputación de la organización, incluidos los favores sexuales prácticas que son
    rechazada definitivamente y que no solo constituye un delito sexual, sino también un delito de
    corrupción.
    • No se permite las relaciones parentales u amorosas entre facilitador y facilitado para reducir la
    percepción de favoritismo, y fortalecer el comportamiento profesional por encima del personal.
    En caso de que se presente una relación amorosa entre facilitador y facilitado, será motivo de
    que se comunique al área de Desarrollo de Talento para que se priorice el cambio de área del
    facilitado en un periodo no mayor a 2 meses, comunicándole los puestos vacantes donde pueda
    aplicar por sus habilidades. Incluso cuando se haya terminado dicha relación, con la intención
    de mantener un comportamiento siempre profesional, es necesario realizar el movimiento
    lateral del facilitado a otra área. En caso de que no se pueda dar el movimiento lateral, se
    deberá rescindir la relación laboral del facilitado. Si la situación no se comunicó a Desarrollo
    de Talento de manera directa por parte de los involucrados, se procederá con la rescisión
    laboral de ambos.
    Nota: Puede haber excepciones a esta regla siempre y cuando haya una autorización directa
    del consejo de administración.
    3.4 Cuidado del buen nombre y las marcas de CompuSoluciones
    Está prohibido:
    • Utilizar las herramientas de trabajo que se te brindan para acudir a lugares o utilizarlos en
    situaciones que puedan afectar o poner en entredicho el buen nombre de CompuSoluciones.
    • Hacer mal uso de las marcas (subir información, opinar, criticar, entre otros) en medios
    electrónicos, redes sociales o cualquier otro medio.
    En el caso de personas que no sean colaboradores y hagan mal uso de la imagen o atenten contra
    ella a través de cualquier medio o forma, CompuSoluciones iniciará acciones legales con las
    autoridades correspondientes para proceder en su contra y responder por el daño causado.
    3.5 Conductas con respecto al trato entre Facilitador – Colaborador
    El papel del colaborador que es Facilitador:
    • Establecer/Actualizar los controles señalados en los procesos, los cuales están diseñados para
    mantener el control sin agobiar al colaborador.
    • Atender con oportunidad los problemas o situaciones que puedan generar estrés en los
    facilitados.
    • Aceptar la discusión y propuestas de ideas de los facilitados, escucharlos y dejarlos participar,
    eleva el nivel de pertenencia de equipo.
    • Conceder autoridad: se contribuye más a los objetivos cuando se permite concentrarse en los
    asuntos clave.
    • Comunicarse claramente: ofrecer la imagen más clara del encargo, los resultados que se
    esperan, el plazo, la autoridad que se concede y la información que se desea recibir en el avance
    del proceso.
    • Controlar los resultados, no el método.
    • Acreditar el éxito, no el fracaso.
    • Verbalizar el apoyo.
    • Desarrollar y facilitar al equipo de trabajo.
    • Trato digno y respetuoso del facilitador hacia las personas a su cargo (no burlas, bullying, no
    bromas pesadas).
    El papel del colaborador que es facilitado:
    • Aceptar la responsabilidad por la ejecución del encargo que se asigna tomando en cuenta las
    capacidades.
    • Funcionar dentro de los límites de autoridad que se confieren.
    • Esforzarse en beneficio del equipo y de la empresa.
    • Mantenerse absolutamente responsable de los resultados que se obtengan.
    • Asegurarse de que la delegación encomendada sea realista.
    • Ejecutar lo que se ha delegado.
    • Comprometerse al desarrollo integral/Cumplir con el plan de capacitación.
    I Conductas con
    Respecto a Nuestros
    Clientes I
    Conductas con Respecto a Nuestros Clientes
    Carta Compromiso
    4.1 Nuestra promesa de protección al Distribuidor y/o Cliente (Usuario Final)
    Nuestros Distribuidores/Clientes son nuestra razón de ser, por lo que se convierten en el centro de
    todo lo que hacemos y protegerlos es primordial en nuestro hacer diario. Para proteger a nuestros
    Distribuidores/Clientes, construimos mecanismos eficaces que nos permitan mantenerlos como la
    fuerza impulsora de nuestras acciones. Informando y capacitando a nuestros colaboradores y
    Distribuidores /Clientes, podemos ayudarles a tomar mejores decisiones que pueden ser críticas
    para sus empresas.
    Con el fin de continuar ofreciendo valor al mercado de manera responsable, es fundamental que
    cumplamos en nuestro actuar diario con los siguientes principios:
    • Productos y Servicios adecuados. Desarrollar y ofrecer productos y servicios que atiendan
    diversas necesidades, siendo indispensable analizar las necesidades específicas del cliente
    tomando en cuenta sus características, con la intención de que el producto o servicio ofrecido
    brinde el valor esperado.
    • Transparencia. Comunicar a los clientes información sobre precios, términos y condiciones de
    manera oportuna y suficiente, utilizando un lenguaje que los clientes entiendan, para que
    puedan tomar decisiones informadas. Compartir con nuestros colaboradores resultados
    financieros, estrategias comerciales, proyectos, proceso y políticas, así como las métricas,
    gastos, evaluaciones, responsabilidades, reconocimientos etc. mediante la herramienta de
    Organigrama Enriquecido.
    • Trato justo y respetuoso de los clientes. Respetar en todo momento la dignidad de nuestros
    clientes y compañero de trabajo comportándonos éticamente y ofreciendo un servicio de
    excelencia.
    • Mecanismos para la resolución de quejas. Informar claramente al cliente los medios adecuados
    para comunicar sus quejas o comentarios, mediante un sistema institucional responsable para
    administrar y resolver las quejas oportunamente.
    • Privacidad de datos de clientes, proveedores, colaboradores y accionistas. Los datos del cliente
    son protegidos según los estándares y requerimientos de las leyes de protección de datos.
    4.2 En relación con los clientes buscar:
    CompuSoluciones puede ser selectiva al escoger clientes y distribuidores. Si la empresa decide no
    hacer negocios con alguien, no es necesario que ofrezca explicaciones sobre su decisión y la mejor
    forma de actuar es no hacerlo. Se debe contar con la autorización del director de área antes de
    terminar la relación entre un Distribuidor y CompuSoluciones.
    Por ello debemos:
    • Mantener los más altos patrones de integridad cuando realice afirmaciones sobre sus productos
    y servicios, enfatizando la calidad y el valor que CompuSoluciones puede ofrecer y evitando
    comentarios desleales o exagerados sobre los competidores.
    • Ofrecer a cada cliente los productos o servicios que más se adecuen a sus características y
    necesidades. Mantenerse al tanto de las modificaciones a dichos productos y servicios de tal
    manera que se mejoren las opciones cuando éstas se presenten.
    • Hacer del conocimiento de la Dirección, a la brevedad posible, cualquier situación provocada
    por CompuSoluciones que cause o pueda causar daño o perjuicio a uno o más clientes, o que
    represente un conflicto entre estos y nuestra empresa, si el colaborador no puede resolverlos
    por sí mismo.
    • Saber que CompuSoluciones puede influir sobre los precios de reventa de muchas formas
    legítimas, por ejemplo, sugiriendo precios de reventa o rangos de precios. CompuSoluciones
    no puede forzar a los distribuidores para que cobren un precio específico. Por lo anterior, no
    es aceptable el prestarnos para apoyar a un distribuidor durante su proceso de licitación ante
    entidades gubernamentales a encontrar empresas que le apoyen a dar precios por encima de
    los cotizados, pues se considera engaño y afecta el proceso de libre competencia que rige
    nuestros principios, lo anterior incluso a nivel de acordado, consulta y menos aún
    implementado, así sea por escrito o verbalmente.
    • No favorecer a un cliente sobre otro sin que haya una razón de peso.
    • Cumplir con todas y cada una de las políticas, procesos, procedimientos y metodología de
    CompuSoluciones.
    4.3 En las relaciones con clientes evitar:
    • Tener cualquier comunicación, acción u omisión que pueda engañar a un cliente o distribuidor.
    Antes de establecer un compromiso se debe asegurar de que existe una alta probabilidad de
    cumplirlo y después realizar el mejor esfuerzo para completarlo, cuando se perciba que no es
    posible llevarlo a término, se debe comunicar de inmediato a nuestro cliente y analizar con él
    otras posibilidades de lograr su satisfacción.
    • Proporcionar información de las operaciones realizadas por un cliente a personas ajenas a
    CompuSoluciones o al cliente.
    • Recibir pagos en efectivo de los clientes, aún con el argumento de pago o cobranza de alguna
    obligación comercial.
    • Beneficiar a un cliente deudor del pago recibido por otro cliente.
    • Solicitar al cliente garantías no autorizadas para el otorgamiento de un crédito.
    • Solicitar a clientes morosos el pago de cargos o intereses moratorios adicionales a los
    establecidos en las políticas.
    • Alentar, ofrecer o garantizar oportunidades de trabajo en CompuSoluciones con colaboradores
    de nuestros clientes o distribuidores. El departamento de Desarrollo de Talento no los
    selecciona como candidatos para ninguna de nuestras vacantes en tanto sigan trabajando con
    algún cliente o distribuidor. Más aun, no se recibe ni siquiera su solicitud o currículum para
    evitar conflicto de intereses, incluso en apariencia. Cualquier excepción a esta regla, debe ser
    autorizada por la Dirección General.
    • Mantener o establecer relaciones con clientes o prospectos que tengan alguna relación con la
    delincuencia organizada.
    I Conductas con
    Respecto a los
    Proveedores I
    Conductas con Respecto a los Proveedores
    5.1 Política General
    Las relaciones de CompuSoluciones con los proveedores son de gran importancia estratégica.
    Cuando se haga trato con los proveedores, se debe emplear el sentido común, buen juicio y los más
    altos patrones de integridad.
    A continuación, mostramos como ejemplos algunos estándares que aplican en la relación con los
    proveedores:
    • Trabajamos con aquellos proveedores que comparten nuestros valores éticos, así como los que
    posean una reputación de integridad y equidad en su trato.
    • Los colaboradores que negocien la adquisición de los bienes y servicios deben ofrecer y exigir
    a los proveedores un trato equitativo y honesto en cada transacción, custodiando siempre los
    intereses de CompuSoluciones bajo el principio de ganar-ganar entre las partes.
    • No estás obligado a tratar con todos los potenciales proveedores, ni tampoco a contratar a un
    proveedor basándote exclusivamente en que su precio sea el más bajo o en el hecho de que el
    proveedor sea también un cliente. Al mismo tiempo, se tiene en cuenta que la buena reputación
    de CompuSoluciones con los proveedores depende de hacer elecciones basadas en los méritos.
    • Evita tomar decisiones que se basen o parezcan fundarse en favoritismo personal o en otros
    factores que no estén relacionados con los mejores intereses de CompuSoluciones. Las
    decisiones de compra deben reflejar el mejor juicio sobre tecnología, calidad, tiempo de
    respuesta y plazo de entrega del proveedor, así como en el costo.
    • No permitas que tus decisiones sean influidas por los fuertes lazos de amistad entre el personal
    del proveedor y los representantes o Directivos de CompuSoluciones.
    • La elección de proveedores es imparcial, basada en criterios de calidad, rentabilidad, servicio
    y cuidado del medio ambiente.
    • Cuando se invite a los proveedores potenciales a participar en un proceso formal de ofertas, se
    deben seguir las reglas que se establezcan y anuncien para dicho proceso.
    • En caso de decir que CompuSoluciones ofrece la misma información a todos los proveedores,
    se debe mantener esa promesa. Si las ofertas resultantes reflejan una discrepancia que sugiere
    que un proveedor ha entendido mal nuestros requerimientos, se debe dar a todos los
    proveedores participantes la misma aclaración sobre nuestras necesidades y la misma
    oportunidad para revisar sus ofertas. En otras situaciones de compra menos formales, tenemos
    mayor flexibilidad, pero aun así debemos cumplir con cualquier expectativa que hayamos
    creado cualquiera que sea el procedimiento que hemos elegido.
    • Los consejeros y colaboradores están obligados a dar a conocer el Código a proveedores o
    consultores, y asegurar que éste se vea reflejado en su trabajo relativo a CompuSoluciones.
    • Los colaboradores están obligados a dar un trato digno, respetuoso y justo a los proveedores.
    5.2 En las relaciones con proveedores queda prohibido:
    • Obtener de forma individual un descuento especial por parte de nuestros proveedores en sus
    productos o servicios, salvo que éste sea un beneficio para todos los colaboradores y se les
    comunique previa autorización de la Dirección General de CompuSoluciones.
    • Está prohibido que los colaboradores de CompuSoluciones reciban o entreguen dinero en
    efectivo.
    I Conductas con
    Respecto a las
    Autoridades de
    Gobierno y Leyes I
    Conductas con Respecto a las Autoridades de Gobierno y Leyes
    6.1 Política General
    CompuSoluciones cumple estrictamente con todas las leyes nacionales, estatales, departamentales
    y locales donde se tienen operaciones. Nos sometemos a las leyes y reglamentos que establecen
    las diferentes autoridades en el desarrollo de nuestras actividades. Los consejeros y colaboradores
    deben sujetarse a los siguientes lineamientos:
    • Colaborar con las autoridades competentes en pleno ejercicio de sus facultades y actuar
    conforme a derecho en defensa de los legítimos intereses de CompuSoluciones.
    • En caso de que las autoridades señalen, o las revisiones internas descubran que
    CompuSoluciones no está cumpliendo con alguna Ley o regulación, los colaboradores deben
    avisar a su Facilitador/Dirección General y a Auditoría Interna, y tanto consejeros como
    colaboradores responsables, deben actuar para regularizar la situación y evitar posibles
    inconvenientes y/o gastos derivados de la misma.
    6.2 Conductas en Relación con Autoridades de Gobierno y Leyes
    • Todos los tratos y trámites que se realicen en representación de CompuSoluciones con
    dependencias o funcionarios gubernamentales deben ser honestos, directos y respetando en
    todo momento las leyes.
    • No se debe pagar, directa o indirectamente, con cargo a fondos de CompuSoluciones o
    privados, a organismos de la Administración Pública, funcionarios o colaboradores de esta, con
    la finalidad de promover los negocios de CompuSoluciones. Tampoco, entregar nada de valor,
    incluidos regalos, bebidas, comidas, viajes y atenciones a colaboradores del Gobierno.
    (Generalmente se hace una excepción en el caso de regalos propagandísticos de escaso valor,
    como por ejemplo un calendario o taza de café). Los funcionarios pueden asistir gratuitamente
    a seminarios patrocinados por CompuSoluciones únicamente en caso de que todos los
    restantes participantes también puedan asistir gratuitamente.
    • En cualquier caso, CompuSoluciones no puede pagar la comida o el viaje relacionado con dicho
    seminario. Pueden aplicarse prohibiciones similares por normativa administrativa o por política
    de empresa, en relación con los colaboradores de compañías que ofertan o trabajan en
    licitaciones con gobierno.
    • CompuSoluciones no tiene ninguna filiación política, ni partidista y en cumplimiento a la Ley
    Electoral vigente en los territorios de operación de la compañía, no realiza contribuciones
    económicas, ni en especie. Todos los colaboradores pueden ejercer sus derechos políticos sin
    ser presionados para hacerlo en favor de un partido o una persona en específica. Su
    participación es a título personal y debe realizarse fuera del horario de trabajo, recordando que
    no puede usar bienes ni fondos de la compañía.
    6.3 Derechos de Autor
    Las normativas sobre derechos de autor protegen los libros, artículos, pinturas, caricaturas,
    fotografías, vídeos, música, software y otras formas de expresión, frente a su reproducción para
    uso comercial o para otros fines. Por ejemplo, las normativas sobre derechos de autor normalmente
    prohíben la reproducción de software para fines privados.
    • El colaborador, es responsable del cumplimiento de los derechos de autor en relación con el
    software instalado en su computadora o en las áreas de almacenamiento que están bajo su
    control o se tiene acceso. En ninguna circunstancia se puede copiar, instalar o usar el software
    de forma contraria al acuerdo de licencia de dicho software o a las leyes de propiedad intelectual
    y mucho menos se puede comerciar con ellos.
    • Es responsable del cumplimiento de los derechos de autor en relación con los libros, artículos,
    imágenes, vídeos, música y otras formas de expresión, ya sea que encuentren impresas o en
    formato electrónico. No copiar estos artículos para su propio uso o para el uso de
    CompuSoluciones, a menos que se cuente con el correspondiente permiso, para ello del director
    del Área o bien del área responsable (por ejemplo: sistemas, mercadotecnia, etc.).
    6.4 Cumplimiento con las leyes laborales aplicables
    La Ley Federal de Trabajo en México
    La relación que establece CompuSoluciones con todos sus colaboradores tiene como marco, el
    cumplimiento de la Ley Federal de Trabajo inscrito ante la Secretaría de Trabajo y Prevención Social
    (STPS) y la Junta Local de Conciliación y Arbitraje (JLCA).
    El Código Sustantivo del Trabajo en Colombia
    La relación que establece CompuSoluciones con todos sus colaboradores en Colombia tiene como
    marco, el cumplimiento del código sustantivo del trabajo, sus leyes, decreto Ley, normativas y
    directivas que tutela el Ministerio de Trabajo (MinTrabajo)
    6.5 Cumplimiento a las Leyes de Libre Competencia
    Con la finalidad de apoyar el libre comercio, está prohibido realizar acuerdos con la competencia
    para fijar precios, asignar el mercado, concertar licitaciones y en general cualquier tipo de práctica
    desleal.
    6.6 Prevención de Lavado de Dinero y Financiamiento al Terrorismo (PLD y FT)
    CompuSoluciones está comprometido a colaborar activamente con los organismos
    gubernamentales nacionales e internacionales en la Prevención de Lavado de Dinero y
    Financiamiento al Terrorismo para contribuir así en la lucha contra el crimen organizado.
    Todos los colaboradores deben observar con especial rigor lo establecido por la regulación
    adoptada por CompuSoluciones en materia de Prevención de Lavado de Dinero y Financiamiento
    al Terrorismo.
    I Conductas en
    Relación con la
    Competencia I
    Conductas en Relación con la Competencia
    La experiencia nos demuestra que la competencia es sana; nos obliga a ser mejores, más eficientes,
    a hacer mejor nuestro trabajo y a ser los mejores en nuestro ramo. Al final, el cliente debe ser el
    más beneficiado porque puede elegir la mejor opción.
    Por esta razón, nunca se emprenden acciones encaminadas a restringir la competencia. Los
    consejeros y colaboradores deben apegarse a los siguientes lineamientos:
    • Comercializar los productos y servicios por sus propios méritos.
    • No desacreditar o proporcionar información falsa sobre la competencia.
    • Se puede revisar toda la información pública, tales como especificaciones publicadas, artículos
    que aparecen en revistas comerciales, los que publique en Internet y los materiales que el
    competidor ha hecho públicos a otras empresas y usarla exclusivamente para fines comerciales
    legítimos y facilitarla únicamente a los colaboradores que la necesiten para realizar sus
    actividades.
    • Evitar toda forma de conducta engañosa o de ventaja desleal mediante la manipulación, la
    ocultación o la tergiversación de algún hecho o información específica.
    7.1 En las relaciones con la competencia queda prohibido
    • Los cambios de colaboradores entre células de marca competencia (HP – Lenovo / Lenovo -
    HP), se te pedirá el que hayas pasado por otra área intermedia al menos un año para poder
    aplicar a una vacante de dicha marca competencia, esto aplica en cualquier nivel de la
    estructura.
    • Reunir información de la competencia por medios no éticos, como falsear la propia identidad,
    inducir a un accionista, consejero, colaborador o proveedor de la competencia a divulgar
    información confidencial, u obtener acceso a la información confidencial de la competencia, ya
    sea directamente o a través de terceros.
    • Discutir con la competencia precios, propuestas, márgenes, costos, rebajas, términos de venta,
    capacidades de distribución, clientes, planes comerciales o estrategias de distribución actuales
    o futuras para productos o servicios de la competencia. La única excepción a esta regla es
    cuando la competencia divulga públicamente esta información.
    • Llegar a acuerdos con competidores como medida tendiente al reparto de cliente y/o territorios
    de venta. Cuando la competencia proponga cualquiera de estas prácticas, es obligación de los
    colaboradores involucrados avisar inmediatamente a su Facilitador y a la Dirección General de
    CompuSoluciones.
    • Obtener, por medios impropios, secretos comerciales u otra información privada o confidencial
    de nuestros competidores.
    • Contratar a personas de la competencia sólo con el objeto de obtener información confidencial
    de nuestros competidores.
    • Contratar a personas que provengan de empresas catalogadas como competencia desleal.
    • Utilizar como argumento de venta los errores de la competencia. Los colaboradores deben
    enfocarse en hablar de las ventajas de CompuSoluciones.
    • Desacreditar a la competencia, retirar, cubrir o modificar su propaganda.
    • Caer o inducir en provocaciones con personal de la competencia. Los colaboradores siempre
    deben ofrecer un trato respetuoso, que refleje nuestros valores.
    • Generar condiciones falsas de demanda u oferta de algún producto o servicio con objeto de
    influir artificialmente en sus precios.
    • Colaborar simultáneamente con otra organización que sea competidor de CompuSoluciones.
    I Conductas en
    Relación con los
    Accionistas I
    Conductas en relación con los Accionistas
    Uno de nuestros Objetivos Corporativos es el generar utilidades para ofrecer una rentabilidad
    competitiva a los accionistas, apegándonos en todo momento a la Ley de Sociedad Mercantiles en
    México y al Decreto Único Reglamentario del Sector Comercio, Industria y Turismo en Colombia,
    realizando una vez al año la Junta de Accionistas, en la que se informan los progresos de la
    compañía, los reportes financieros, las acciones de responsabilidad social y toda aquella
    información que les permita tomar decisiones, dejando un espacio abierto para sus
    cuestionamientos al Comité Directivo.
    En forma trimestral se les envía un reporte por escrito para que estén informados de la marcha de
    los negocios.
    8.1 Relaciones con consejeros y colaboradores
    En CompuSoluciones no se discrimina con base en la raza, religión, sexo, edad, nacionalidad,
    estado civil, estado de salud, capacidades diferentes o preferencia sexual de cualquier persona en
    lo que se refiere a la designación de consejeros o con relación al reclutamiento, contratación,
    entrenamiento, promoción, retribución, beneficios, sanciones y otros términos y condiciones de
    empleo. En consecuencia, todas las decisiones y acciones relacionadas a la designación y al empleo
    (contrataciones y promociones) se basan en evaluaciones válidas conforme a las políticas internas
    que muestren si la persona está calificada y es apta para desempeñar el cargo o puesto.
    8.2 Obligaciones de consejeros
    Los consejeros, deben recibir y aprobar anualmente un informe del área de Desarrollo de Talento,
    indicando que ha revisado que todos los colaboradores se han certificado en la comprensión del
    Código de Ética y Conducta o de Buen Gobierno en un plazo de 30 días posteriores a su
    contratación.
    8.3 Prohibiciones para los consejeros
    • Participar como miembro del Consejo de Administración de cualquier otra empresa o
    institución que compita con CompuSoluciones en cualquier mercado, salvo que el mismo
    Consejo lo haya autorizado expresamente.
    • Participar, a título personal o en representación de CompuSoluciones en aquellas actividades
    que sean incompatibles con sus funciones como miembros del Consejo de Administración.
    I Conductas en
    Relación con el Medio
    Ambiente I
    Conductas en Relación con el Medio Ambiente
    CompuSoluciones está comprometido con la protección y preservación del medio ambiente, por lo
    que cuenta con políticas y programas ambientales, que buscan capacitar al personal en la
    sensibilización, el uso responsable y racional de los recursos naturales, reducir los desperdicios, el
    uso de energía y minimizar el impacto ambiental de la operación.
    I Conductas sobre el
    uso de la marca I
    Conductas sobre el uso de la marca
    10.1 Consideraciones de conducta relacionada a la marca
    Somos los principales embajadores de la marca y mientras trabajemos aquí estamos vinculados a
    su imagen y valores de alguna manera.
    Entendemos que las redes sociales son un ámbito personal, pero pasa a ser profesional cuando
    tienes como amigos a fabricantes, asociados, clientes y colaboradores.
    Es importante seguir en redes sociales, durante eventos, convivencias, o en cualquier interacción
    con personas cuya relación haya iniciado de una práctica laboral; los lineamientos y guías de
    conducta de la marca.
    Recuerda
    • Confidencialidad: Protege la información no pública de la empresa y de nuestros clientes (la
    información financiera, comercial, de clientes, de productos y de colaboradores de la empresa).
    • Respeto: Trata la información de los clientes como sensible y evita comentarios en línea sobre
    ellos.
    • Sé amable: Mantén un tono respetuoso en todas tus comunicaciones en línea, evitando
    contenidos ofensivos o agresivos.
    • Diversidad: Respeta las diferentes culturas, puntos de vista y valores, de acuerdo con el código
    de conducta de CompuSoluciones y Asociados.
    CompuSoluciones y Asociados es una compañía donde sus colaboradores y clientes vienen de
    diferentes culturas, puntos de vista y valores. Siempre ten en cuenta el código de conducta de la
    compañía.
    Responsabilidades:
    • Mantener en todas las expresiones públicas, siempre un comportamiento de acuerdo con los
    valores de la marca.
    • Al relacionarte en redes sociales con la compañía o tener en tus contactos alguna persona con
    relación laboral o dentro de la industria, mantener los lineamientos de comportamiento de la
    marca.
    • Validar con MKT Corporativo, cualquier uso de la marca que no esté mencionado dentro del
    manual de identidad.
    Conductas prohibidas:
    • En redes sociales: compartir o publicar contenido intimidatorio, vulgar o agresivo.
    • Publicar fotografías en las oficinas o eventos corporativos, con contenido que no sea profesional
    o relacionado con el negocio.
    • Utilizar logotipos, audios, imágenes y contenido promocional para fines personales o no
    autorizados por MKT Corporativo.
    • Entendemos que las redes sociales son un ámbito personal, pero pasa a ser profesional cuando
    tienes como amigos a fabricantes, asociados, clientes y colaboradores.
    En caso de dudas sobre el código de ética, pregunta. La falta de alineación puede tener
    consecuencias, como:
    • Publicaciones no apropiadas: Se te puede pedir que retires una publicación.
    • Código de vestir: En las instalaciones de CompuSoluciones y Asociados, se puede solicitar que
    te cambies si tu vestimenta no está alineada con el código de vestir.
    • Faltas graves: Se llevarán al comité de ética para determinar la consecuencia.
    Recuerda, siempre es importante distinguir entre tus opiniones personales y la postura oficial de
    CompuSoluciones y Asociados para evitar malentendidos.
    10.2 Código de vestir
    La forma en la que nos vestimos influye en la percepción que los demás tienen de nosotros, y
    recuerda que, en todo momento para el cliente, proveedor y/o fabricante Tu eres la compañía.
    Al momento de elegir tu vestimenta tanto para home office, ir a la oficina, eventos y/o visita con
    cliente, aunque busques la comodidad y la confianza en ti mismo, siempre debes proyectar una
    imagen profesional.
    Prendas Sugeridas:
    • Camisa de manga corta o larga
    • Playeras polo
    • Camisetas en color liso
    • Jeans
    • Pantalón casual tipo chino o de algodón
    • Blusa de cualquier estilo
    • Tenis
    • Falda no más allá de un par de dedos
    por encima de la rodilla
    Prendas prohibidas:
    • Ropa deportiva (pants, licras, playeras de
    Gym, tenis para correr)
    • Ropa y calzado de playa
    • Shorts, bermudas y minifaldas o faldas con
    aberturas muy pronunciadas
    • Pantalones rotos
    • Playeras con estampado infantil y/o artistas
    • Playeras con logotipo de marcas que no
    comercializamos
    • Tops, blusas ombligueras, escotadas, de
    tirante o espalda descubierta.
    • Prendas con transparencia
    10.3 Comportamiento en eventos corporativos
    Al asistir a un evento, ya sea que traigas gafete, playera o simplemente eres invitado como parte
    de la compañía, estás representando a la marca y tu comportamiento refleja la cultura y el valor de
    la marca.
    • Ser puntual, la puntualidad muestra el grado de compromiso e interés
    • Se amable y cordial con todos los presentes
    • Participa de forma auténtica y activa.
    • Cuida el consumo de alcohol
    • No hagas bromas o chistes con lenguaje sexista, racista, homofóbico
    • Mantén una posición neutra si se habla de política y/o religión
    • No puedes perder el respeto y formalidad
    • En general ten una presencia y comportamiento institucional.
    • Consideraciones de conducta relacionada a la marca
    I Comité de Ética I
    Comité de Ética
    El Comité de Ética de CompuSoluciones, está integrado por colaboradores de alta solvencia moral,
    con antigüedad, que sean elegidos por mayoría directa por parte de los actuales miembros y que
    no hayan sido objeto de actas administrativas o amonestaciones.
    El Comité de Ética evalúa, ordinariamente, las violaciones al Código de Ética y Conducta que se le
    presente por parte de colaboradores, clientes, proveedores o accionistas, escuchan a las distintas
    partes involucradas y resuelve, según el caso, sobre la aplicación de sanciones de acuerdo con lo
    estipulado dentro del Reglamento interior de trabajo para México y Colombia, exceptuando aquellos
    asuntos que, por su naturaleza, deban ser atendidos directamente por el Consejo de
    Administración.
    Las sanciones impuestas por el Comité de Ética son consistentes y congruentes en todo momento
    con la severidad de la falta al Código que dio lugar a tal imposición. En este caso de las sanciones
    impuestas por el Comité de Ética y Conducta de CompuSoluciones, son inapelables.
    El Comité de Ética ofrece a todos los colaboradores el seguimiento del buen uso de los Medios de
    reporte, garantizando absoluta confidencialidad.
    Si existiera algún reporte en contra de Auditoría Interna, ésta debe presentarse directamente a
    Dirección General, y si el reporte fuera en contra del presidente del Consejo debe presentarse a la
    Asamblea de Accionistas.
    En el caso de violaciones al Código por consejeros o accionistas, el presidente del Consejo de
    Administración las atiende y propone a la mayoría de los accionistas una sanción inapelable, la
    cual debe ratificarse en la siguiente asamblea ordinaria de accionistas, independientemente de las
    sanciones previstas para consejeros en las leyes aplicables.
    Asimismo, las áreas o personas antes mencionadas deben abstenerse de participar en cualquier
    sesión o manejo de información respecto al reporte.
    11.1 Medios para reportar faltas éticas en la compañía CompuSoluciones
    Son los medios de comunicación institucionales a través de los cuales se reporta el incumplimiento
    de las Normas de conducta, que en algunos casos son totalmente anónimos. Se les invita a los
    colaboradores a vivir nuestros valores y ayudar a conservarlos. Reportar cualquier incumplimiento
    de las Normas de conducta a través de los Medios de reporte institucionales.
    Ofrecemos diversos canales para que los colaboradores reciban asesoramiento sobre temas
    relacionados con la ética y el cumplimiento, y para reportar sospechas de faltas a la ética. Estos
    canales incluyen:
    • El buzón de reportes a través de web, formato físico o celular (33-2833-4827)
    • Los reportes directos utilizando la política de puertas abiertas
    • Las juntas de tercer nivel
    • Las juntas con su Facilitador
    El equipo que conforma el análisis de reportes anónimos recibidos a través del buzón es
    responsable de asegurar que todos los reportes sean adecuadamente evaluados.
    Si se reporta una inquietud o un incumplimiento, se recomienda presentar información precisa y
    completa para permitir una investigación o respuesta exhaustiva. Las omisiones y los errores en
    los datos inicialmente reportados (quién/qué/cuándo/dónde) pueden causar demoras en el
    proceso de recepción del caso y/o pueden demorar o tener un impacto negativo en la asignación
    del caso y/o el proceso de investigación.
    El uso de los medios institucionales garantiza absoluta confidencialidad. El Comité de Ética de
    CompuSoluciones recibe el reporte y toma las acciones apropiadas.
    Antes de hacer cualquier tipo de reporte relativa al Código, se debe tomar en cuenta las siguientes
    consideraciones:
    11.2 Razonar muy bien antes de actuar
    • Evaluar las acciones y consecuencias.
    • Considerar quien puede verse afectado con la decisión en caso de que la percepción del
    colaborador no sea correcta.
    11.3 Consultar el Código de Ética y Conducta
    • Identificar qué fundamento, valor y/o norma de conducta es la que se está infringiendo.
    11.4 Proceder con confianza
    • Comunicar la decisión a través de los medios de reporte institucionales.
    • Aportar elementos de tiempo, modo y lugar, así como pruebas, testigos y detalles.
    Es importante recordar que un valor muy importante es la integridad, por lo que los reportes deben
    ser objetivos, fundamentados y sustentados, aportando para ello los elementos suficientes para
    probar el dicho imputado. Ser consciente que involucrar el prestigio de un consejero o colaborador
    inocente, o no informar con oportunidad algún tipo de violación al Código, hace responsable al
    colaborador que lo reporta en un principio.
    Es el Comité de Ética, quien se encarga de realizar las investigaciones pertinentes acerca de los
    reportes y turnar los resultados a Desarrollo de Talento. Los colaboradores tienen en todo momento
    el derecho de ser escuchados previo a la aplicación de las sanciones, es decir durante el proceso
    de investigación o posterior al presentarle las pruebas encontradas.
    Las violaciones al presente Código de Ética y Conducta son calificadas a través del Comité de Ética,
    sancionadas a través de cualquiera de las siguientes acciones:
    A. La amonestación verbal: es la medida disciplinaria que se le impone a los colaboradores por
    conducto de quien haya designado el Comité de Ética, la cual consiste en una llamada de
    atención verbal por el incumplimiento u omisión de las políticas y obligaciones propias del
    colaborador, misma que debe realizarse en un lugar independiente al lugar donde se encuentren
    los demás colaboradores, como por ejemplo un cubículo o una oficina, y la cual debe hacerse
    del conocimiento del área de Desarrollo de Talento.
    B. Acta administrativa: aplica cuando se presente un hecho que va en contra de alguna de las
    normas de la empresa previamente sustentadas en el código de ética, política o reglamento
    interior del trabajo, el documento elaborado sirve para marcar antecedente de lo ocurrido y que
    haya representado alguna afectación para la organización y/o sus componentes.
    C. Periodo de prueba: debe ser tomado como una oportunidad de mejora a un comportamiento,
    actitud o bajo desempeño a través de indicadores y actividades específicas perfiladas a la
    Cultura CompuSoluciones si aplica, en la que se notifican las causas que le dieron origen, en el
    entendido de que CompuSoluciones analiza las causas sin perjuicio de tomar una
    determinación posterior.
    D. Terminación laboral: es la medida disciplinaria que se impone, si aplica en el caso que las
    violaciones al Código de Ética así ameriten la toma de decisión, independientemente de que el
    colaborador sea acreedor de las sanciones civiles, penales, administrativas o de cualquier otra
    índole que se le pudieran imponer debido a tal incumplimiento grave.
    11.5 Interpretación
    En caso de duda o controversia sobre la interpretación o aplicación del Código, los colaboradores
    deben consultar directamente a su Facilitador como primera instancia, al siguiente nivel, a
    Dirección, al departamento de Desarrollo de Talento o bien con Auditoría Interna.
    11.6 Seguimiento y actualización del Código
    Para verificar la correcta aplicación de los principios enunciados en el Código, se aplican encuestas
    de clima y servicio, de carácter interno con colaboradores y de carácter externo con clientes y
    proveedores. Estas encuestas ayudan a detectar desviaciones que puedan afectar el sano desarrollo
    de nuestras actividades y sirven para implementar, en su caso, mecanismos que garanticen la
    correcta interpretación y observancia de los principios.
    La responsabilidad inmediata del diseño, periodicidad y aplicación de las encuestas y de la revisión
    de los resultados obtenidos recae en el Comité de Ética, la cual debe coordinar esfuerzos con
    Dirección para alcanzar la meta planteada.
    Los resultados obtenidos en la aplicación de las encuestas deben ser informados al Consejo de
    Administración a través del Comité de Auditoría y a todos aquellos que el Consejo de Administración
    de CompuSoluciones determine.
    La Dirección General de CompuSoluciones es la responsable de proponer actualizaciones y difundir
    por lo menos una vez al año el Código, asignando a un equipo multidisciplinario de contenidos esta
    labor. Este equipo está conformado por las áreas de Auditoría, Desarrollo de Talento, Marketing
    Corporativo, Procesos y Legal. Toda actualización debe presentarse Desarrollo de Talento para su
    aprobación.
    Asimismo, Desarrollo de Talento, debe asegurar que la difusión de las actualizaciones al Código se
    realice íntegramente para todos los colaboradores, previamente aprobado por el Consejo de
    Administración a través del Comité de Auditoría.
    11.7 Glosario:
    Algunos términos utilizados en CompuSoluciones:
    • Distribuidor: Cliente que firma un manual de operaciones con Crédito y Cobranza
    • Cliente: Usuario final.
    • Facilitador: Colaborador que tiene personal bajo su cargo.
    • Desarrollo de Talento: Departamento de Recursos Humanos
    • Lavado de dinero: La ocultación o disimulación de la verdadera naturaleza, el origen, la
    ubicación, la disposición, el movimiento o la propiedad de bienes o del legítimo derecho a éstos.
    • Corrupción: Posibilidad de que, por acción u omisión, mediante el uso indebido del poder, de
    los recursos o de la información, se lesionen los intereses de una entidad, y en consecuencia
    del Estado, para la obtención de un beneficio particular o para terceros. Los riesgos asociados
    a la corrupción, por medio de los cuales se puede materializar, son: reputacional, legal,
    operativo, contable y contagio, entre otros.`; // entrenamiento

    try {
         
        const serviceContext = serviceContextFromDefaults({
            llm: new OpenAI({ model: 'gpt-4o', temperature: 0}),
            nodeParser: new SimpleNodeParser({
                chunkSize: 1024,
                chunkOverlap: 40,
            })
        });
        const evaluator = new RelevancyEvaluator();
        const documents = [
          new Document({
            text: training,
          })]

          const storageContext = await storageContextFromDefaults({
            persistDir: "./storage",
          });
          console.log('entrenando', storageContext);
        const vectorIndex = await VectorStoreIndex.fromDocuments(documents, { serviceContext, storageContext });
        const queryEngine = vectorIndex.asQueryEngine();

        const response = await queryEngine.query({
          query: prompt,
        });

        const result = await evaluator.evaluateResponse({
          query:prompt,
          response: response,
        });


        res.status(200).json({msg: result});
    } catch (err) {
        console.log(err);
        res.status(400).json({msg: 'Se obtuvo un error'});
    }

};