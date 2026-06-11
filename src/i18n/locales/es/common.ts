export const common = {
  appName: "Servease",
  legal: {
    back: "Volver",
    contactLabels: {
      email: "Correo electrónico:",
      institution: "Institución:",
      city: "Ciudad:",
    },
    terms: {
      title: "TÉRMINOS Y CONDICIONES DE USO",
      subtitle: "Sistema de Control y Contratación de Servicios",
      tagline: "\"La forma más Ease de encontrar tu solución\"",
      version: "Versión 1.0 | Enero 2026 | Tijuana, Baja California, México",
      footer: "Servease © 2026 — Todos los derechos reservados.",
      sections: [
        {
          h: "1. Aceptación de los Términos",
          c: [
            "Al registrarte, acceder o utilizar la plataforma Servease (en adelante, 'la Plataforma'), aceptas de forma expresa, libre e informada los presentes Términos y Condiciones de Uso (en adelante, 'los Términos'). Si no estás de acuerdo con alguno de los términos aquí establecidos, debes abstenerte de utilizar la Plataforma.",
            "El uso de la Plataforma implica la aceptación total de los presentes Términos, así como de la Política de Privacidad de Servease, que forma parte integrante de este documento. Servease se reserva el derecho de modificar estos Términos en cualquier momento, notificando los cambios con al menos 10 días de anticipación."
          ]
        },
        {
          h: "2. Descripción del Servicio",
          c: [
            "Servease es una plataforma tecnológica digital que actúa como intermediario entre personas que requieren la contratación de servicios y oficios (en adelante, 'Clientes') y personas que ofrecen dichos servicios (en adelante, 'Proveedores'). La Plataforma facilita el proceso de contratación mediante las siguientes funcionalidades principales:",
            ["Publicación de solicitudes de servicio por parte de los Clientes.", "Postulación y envío de propuestas por parte de los Proveedores.", "Herramientas de negociación directa (contraofertas) entre ambas partes.", "Canal de comunicación privado (chat) activado tras la aceptación formal del servicio.", "Sistema de geolocalización para conectar a usuarios dentro del municipio de Tijuana, Baja California.", "Sistema de calificaciones y reseñas mutuas entre Clientes y Proveedores.", "Procesamiento de pagos con cobro de comisión mensual al Proveedor por el uso de la Plataforma."],
            { b: true, v: "Servease NO es una agencia de empleo, NO garantiza la calidad técnica del trabajo físico realizado, y NO establece relaciones laborales de ningún tipo entre la Plataforma y los Proveedores. La Plataforma actúa únicamente como enlace tecnológico entre las partes." }
          ]
        },
        {
          h: "3. Registro y Tipos de Cuenta",
          c: [
            { sh: "3.1 Tipos de cuenta" },
            "Dentro de la Plataforma existen dos tipos de rol para los usuarios:",
            ["Cliente: usuario que publica solicitudes de servicio, revisa propuestas, acepta o rechaza postulaciones y realiza pagos. No existe restricción de edad para registrarse como Cliente.", "Proveedor: usuario que busca y aplica a solicitudes publicadas, envía propuestas y contraofertas, y realiza los servicios acordados. Para activar el rol de Proveedor, el usuario debe ser mayor de 18 años y tener capacidad legal para celebrar contratos."],
            { sh: "3.2 Cambio de rol a Proveedor" },
            "Cualquier usuario registrado como Cliente podrá solicitar la activación del rol de Proveedor dentro de la Plataforma, siempre que cumpla con el requisito de mayoría de edad (18 años cumplidos). Al solicitar este cambio de rol, el usuario declara bajo su responsabilidad que cumple con dicho requisito.",
            { sh: "3.3 Responsabilidad de la cuenta" },
            "El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso. Cualquier actividad realizada desde su cuenta se considerará realizada por el titular. Debe notificarse de inmediato a Servease cualquier uso no autorizado. Servease se reserva el derecho de suspender o cancelar cuentas que incumplan los presentes Términos."
          ]
        },
        {
          h: "4. Proceso de Contratación",
          c: [
            { sh: "4.1 Publicación de solicitudes (Cliente)" },
            "El Cliente podrá crear publicaciones especificando: título del servicio, descripción, categoría, ubicación dentro del municipio de Tijuana y precio estimado. El Cliente es el único responsable de la veracidad y exactitud de la información publicada.",
            { sh: "4.2 Postulación (Proveedor)" },
            "El Proveedor podrá postularse a las solicitudes que se ajusten a su perfil y habilidades. El envío de una postulación no garantiza su aceptación por parte del Cliente.",
            { sh: "4.3 Contraofertas y negociación" },
            "Ambas partes podrán realizar contraofertas para acordar el precio final del servicio. El precio acordado es vinculante una vez que ambas partes lo acepten formalmente dentro de la Plataforma.",
            { sh: "4.4 Aceptación y rechazo" },
            "El Cliente tiene el derecho exclusivo de aprobar o rechazar las postulaciones recibidas. La aceptación formal activa el canal de chat entre las partes para coordinar los detalles logísticos del servicio.",
            { sh: "4.5 Ejecución y cierre del servicio" },
            "Al finalizar el trabajo, cualquiera de las partes podrá marcar el servicio como 'Concluido'. Al cerrarse, ambas partes podrán calificarse mutuamente con una puntuación del 1 al 5. El chat pasará a modo solo lectura una vez concluido el servicio."
          ]
        },
        {
          h: "5. Pagos y Comisiones",
          c: [
            { sh: "5.1 Métodos de pago" },
            "Los servicios contratados a través de la Plataforma pueden liquidarse de dos maneras:",
            ["Efectivo: el pago se realiza directamente entre Cliente y Proveedor al momento o acuerdo de la prestación del servicio.", "Tarjeta bancaria: el pago se procesa de forma segura a través de Stripe. Todas las transacciones se realizan en Pesos Mexicanos (MXN)."],
            { sh: "5.2 Comisión mensual al Proveedor" },
            { b: false, v: "El uso de la Plataforma como Proveedor implica el pago de una comisión mensual del 3% sobre el total de ganancias acumuladas en dicho mes dentro de Servease, independientemente del método de pago utilizado en cada servicio." },
            { i: true, v: "Ejemplo: si un Proveedor acumuló $10,000 MXN en ganancias durante el mes, la comisión a pagar al cierre del período será de $300 MXN." },
            "Esta comisión podrá ajustarse en versiones futuras de la Plataforma, notificando a los usuarios con anticipación conforme a lo establecido en la sección de modificaciones de estos Términos. La comisión aplica exclusivamente a los Proveedores; los Clientes no tienen ningún cargo por el uso de la Plataforma.",
            { sh: "5.3 Pagos fuera de la plataforma" },
            "Servease no se responsabiliza por acuerdos o pagos realizados fuera de los canales internos de la Plataforma. Se recomienda a los Proveedores registrar correctamente los servicios realizados para el cálculo preciso de su comisión mensual."
          ]
        },
        {
          h: "6. Sistema de Calificaciones y Reputación",
          c: [
            "Al concluir un servicio, ambas partes podrán calificarse mutuamente con una puntuación numérica del 1 al 5 y dejar comentarios. Estas calificaciones son públicas y forman parte del perfil de reputación de cada usuario. Queda estrictamente prohibido:",
            ["Publicar calificaciones falsas o malintencionadas.", "Solicitar o presionar a otros usuarios para obtener calificaciones específicas.", "Crear cuentas falsas para manipular el sistema de calificaciones."],
            "Servease se reserva el derecho de eliminar calificaciones que considere fraudulentas, abusivas o contrarias a los presentes Términos."
          ]
        },
        {
          h: "7. Conducta del Usuario",
          c: [
            "Al utilizar la Plataforma, el usuario se compromete a:",
            ["Proporcionar información veraz y actualizada en su perfil y publicaciones.", "Utilizar el chat exclusivamente para coordinar los detalles del servicio acordado.", "Respetar a los demás usuarios y mantener un trato digno y profesional.", "No utilizar la Plataforma para actividades ilegales, fraudulentas o contrarias a la moral.", "No compartir información personal sensible (datos bancarios, contraseñas) a través del chat.", "No publicar contenido ofensivo, discriminatorio, amenazante o que viole derechos de terceros."],
            "El incumplimiento de estas normas podrá resultar en la suspensión temporal o cancelación definitiva de la cuenta, sin perjuicio de las acciones legales que correspondan."
          ]
        },
        {
          h: "8. Limitación de Responsabilidad",
          c: [
            "Servease actúa únicamente como intermediario tecnológico y no es parte en los acuerdos celebrados entre Clientes y Proveedores. En consecuencia, Servease no asume responsabilidad por:",
            ["La calidad, resultado o garantía de los servicios prestados por los Proveedores.", "Daños materiales, personales o económicos ocasionados durante la prestación del servicio.", "El incumplimiento de los acuerdos entre Clientes y Proveedores.", "La exactitud de la información publicada por los usuarios.", "Interrupciones del servicio causadas por fuerza mayor, fallos de terceros o mantenimiento programado."],
            "En ningún caso la responsabilidad total de Servease ante un usuario excederá el monto de la comisión cobrada al Proveedor en el período mensual objeto de la reclamación."
          ]
        },
        {
          h: "9. Propiedad Intelectual",
          c: [
            "Todo el contenido de la Plataforma, incluyendo logotipos, diseños, código fuente, interfaces, textos y gráficos, es propiedad exclusiva de Servease o de sus respectivos titulares y está protegido por las leyes de propiedad intelectual aplicables en México. El usuario no podrá copiar, reproducir, distribuir, modificar ni crear obras derivadas sin consentimiento previo y por escrito de Servease.",
            "El usuario conserva la propiedad de los contenidos que publique y otorga a Servease una licencia no exclusiva, gratuita y revocable para utilizarlos con el único fin de operar y mejorar la Plataforma."
          ]
        },
        {
          h: "10. Suspensión y Cancelación",
          c: [
            "Servease se reserva el derecho de suspender o cancelar el acceso a la Plataforma, de forma temporal o definitiva y sin previo aviso, en los siguientes casos:",
            ["Incumplimiento de los presentes Términos y Condiciones.", "Uso fraudulento o malintencionado de la Plataforma.", "Actividades que pongan en riesgo la seguridad de otros usuarios o de la Plataforma.", "Resolución judicial o requerimiento de autoridad competente."],
            "El usuario podrá solicitar la cancelación de su cuenta en cualquier momento. La cancelación no exime de las obligaciones pendientes al momento de la solicitud."
          ]
        },
        {
          h: "11. Alcance Geográfico",
          c: [
            "En su fase inicial, la Plataforma opera exclusivamente dentro del municipio de Tijuana, Baja California, México. No se gestionarán servicios fuera de este ámbito. Servease se reserva el derecho de expandir su cobertura geográfica en fases posteriores de desarrollo."
          ]
        },
        {
          h: "12. Legislación Aplicable y Resolución de Controversias",
          c: [
            "Los presentes Términos se rigen por las leyes vigentes en los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de la ciudad de Tijuana, Baja California, renunciando a cualquier otro fuero. Antes de acudir a instancias judiciales, las partes se comprometen a intentar resolver cualquier disputa de forma amigable a través de los canales oficiales de Servease."
          ]
        },
        {
          h: "13. Contacto",
          c: [
            { contact: true, email: "0323105874@ut-tijuana.edu.mx", institution: "Universidad Tecnológica de Tijuana", city: "Tijuana, Baja California, México" }
          ]
        }
      ]
    },
    privacy: {
      title: "POLÍTICA DE PRIVACIDAD",
      subtitle: "Sistema de Control y Contratación de Servicios",
      tagline: "\"La forma más Ease de encontrar tu solución\"",
      version: "Versión 1.0 | Enero 2026 | Tijuana, Baja California, México",
      footer: "Servease © 2026 — Todos los derechos reservados.",
      intro: "En Servease nos comprometemos con la protección de tus datos personales. La presente Política de Privacidad describe qué información recopilamos, cómo la utilizamos, con quién la compartimos y los derechos que tienes sobre ella. Este documento cumple con lo establecido en la Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP) vigente en los Estados Unidos Mexicanos.",
      accept: "Al registrarte y utilizar la plataforma Servease, aceptas los términos de esta Política de Privacidad. Si no estás de acuerdo con su contenido, te pedimos que no utilices la Plataforma.",
      sections: [
        {
          h: "1. Responsable del Tratamiento de Datos",
          c: [
            "El responsable del tratamiento de los datos personales es el equipo de desarrollo de Servease, conformado por estudiantes de la Universidad Tecnológica de Tijuana bajo el marco del proyecto académico 'Sistema de Control y Contratación de Servicios'.",
            { contact: true, email: "0323105874@ut-tijuana.edu.mx", institution: "Universidad Tecnológica de Tijuana", city: "Tijuana, Baja California, México" }
          ]
        },
        {
          h: "2. Datos Personales que Recopilamos",
          c: [
            { sh: "2.1 Datos proporcionados directamente por el usuario" },
            "Al registrarte en la Plataforma, recopilamos únicamente los siguientes datos:",
            ["Nombre completo (nombre y apellidos).", "Correo electrónico.", "Contraseña (almacenada de forma encriptada; nunca en texto plano).", "Foto de perfil (opcional)."],
            { sh: "2.2 Datos recopilados de forma automática" },
            "Durante el uso de la Plataforma se recopilan automáticamente ciertos datos técnicos:",
            ["Datos de geolocalización: con tu consentimiento previo, se accede a tu ubicación para mostrar servicios disponibles dentro del municipio de Tijuana. Puedes revocar este permiso desde la configuración de tu navegador o dispositivo.", "Datos de uso y navegación: páginas visitadas, acciones realizadas dentro de la Plataforma, tiempo de sesión.", "Información del dispositivo: tipo de navegador, sistema operativo, dirección IP.", "Registros de errores del sistema (logs) con fines técnicos y de mantenimiento."],
            { sh: "2.3 Datos financieros" },
            { b: false, v: "Los pagos dentro de la Plataforma pueden realizarse en efectivo o mediante tarjeta bancaria. Los pagos con tarjeta son procesados por Stripe, un proveedor externo de servicios de pago. Servease no almacena ni tiene acceso directo a los datos de tarjetas de crédito o débito. El tratamiento de datos financieros con tarjeta se rige por la política de privacidad de Stripe (stripe.com/privacy)." }
          ]
        },
        {
          h: "3. Finalidad del Tratamiento de Datos",
          c: [
            { sh: "3.1 Finalidades necesarias para el servicio" },
            ["Creación, gestión y autenticación de cuentas de usuario.", "Gestión del proceso de contratación (publicaciones, postulaciones, contraofertas, aceptaciones).", "Facilitar la comunicación entre Clientes y Proveedores a través del chat interno.", "Procesamiento de pagos y cobro de comisiones mensuales a Proveedores.", "Gestión del sistema de calificaciones y reputación.", "Geolocalización para mostrar servicios disponibles en el área del usuario dentro de Tijuana.", "Atención a solicitudes de soporte técnico y cumplimiento de obligaciones legales."],
            { sh: "3.2 Finalidades secundarias (opcionales)" },
            ["Envío de notificaciones sobre el estado de los servicios.", "Mejora continua de la Plataforma mediante análisis de uso agregado y anonimizado."],
            "Si no deseas que tus datos sean utilizados para finalidades secundarias, puedes manifestarlo contactando a nuestro equipo sin que esto afecte el uso normal de la Plataforma."
          ]
        },
        {
          h: "4. Base Legal del Tratamiento",
          c: [
            ["Consentimiento: al registrarte y aceptar esta Política, otorgas tu consentimiento libre, expreso e informado.", "Ejecución del contrato: el tratamiento es necesario para la prestación de los servicios que ofrece la Plataforma.", "Cumplimiento de obligaciones legales: en los casos en que la ley mexicana así lo requiera.", "Interés legítimo: para la seguridad de la Plataforma, prevención de fraudes y mantenimiento técnico."]
          ]
        },
        {
          h: "5. Compartición y Transferencia de Datos",
          c: [
            { sh: "5.1 Datos compartidos entre usuarios" },
            ["Los Clientes pueden ver el nombre, calificación promedio, historial de servicios e información de perfil del Proveedor.", "Los Proveedores pueden ver el nombre, calificación promedio e historial de solicitudes del Cliente.", "La ubicación exacta del lugar de servicio solo se revela al Proveedor una vez que el Cliente acepta formalmente su postulación."],
            { sh: "5.2 Proveedores de servicios externos" },
            ["Stripe: procesamiento de pagos con tarjeta y gestión de transacciones financieras.", "Google Maps Platform: renderizado de mapas y servicios de geolocalización."],
            "Estos proveedores actúan como encargados del tratamiento y están obligados a proteger tus datos conforme a sus propias políticas de privacidad y a la normativa aplicable.",
            { sh: "5.3 Transferencias legales" },
            "Servease podrá divulgar datos personales cuando sea legalmente obligado por mandato judicial o requerimiento de autoridad competente, o para proteger los derechos, la propiedad o la seguridad de la Plataforma y sus usuarios.",
            { sh: "5.4 No venta de datos" },
            { b: true, v: "Servease NO vende, alquila ni comercializa datos personales de sus usuarios a terceros con fines publicitarios o comerciales ajenos a la operación de la Plataforma." }
          ]
        },
        {
          h: "6. Geolocalización",
          c: [
            "La Plataforma solicita acceso a tu ubicación geográfica para mostrarte servicios disponibles en tu área dentro del municipio de Tijuana. Su uso requiere tu consentimiento explícito a través del navegador o dispositivo. Puedes revocar el permiso en cualquier momento; al hacerlo, algunas funcionalidades basadas en localización podrían verse limitadas. Los datos de ubicación no se almacenan de forma permanente ni se comparten fuera del contexto operativo de la Plataforma."
          ]
        },
        {
          h: "7. Seguridad de los Datos",
          c: [
            "Servease implementa medidas técnicas y organizativas para proteger tus datos personales:",
            ["Cifrado de contraseñas mediante algoritmos de hashing seguros.", "Comunicación cifrada mediante protocolo HTTPS con certificados TLS 1.3.", "Control de acceso por roles que restringe el acceso a información según el tipo de usuario.", "Validación y saneamiento de entradas para prevenir ataques de inyección (SQL Injection, XSS).", "Registro de errores y auditoría interna para detección y corrección de incidencias."],
            "Ningún sistema puede garantizar seguridad absoluta. En caso de brecha de seguridad que afecte tus datos, te notificaremos conforme a la normativa vigente."
          ]
        },
        {
          h: "8. Conservación de los Datos",
          c: [
            "Tus datos se conservarán mientras tu cuenta permanezca activa y durante el tiempo necesario para cumplir con las finalidades descritas. Al solicitar la cancelación de tu cuenta, Servease procederá a eliminar o anonimizar tus datos en un plazo razonable, excepto aquellos que deban conservarse por obligaciones legales (por ejemplo, historial de transacciones financieras)."
          ]
        },
        {
          h: "9. Derechos ARCO del Titular",
          c: [
            "Conforme a la LFPDPPP tienes derecho a:",
            ["Acceso: conocer qué datos personales tenemos sobre ti y cómo los utilizamos.", "Rectificación: solicitar la corrección de datos inexactos, incompletos o desactualizados.", "Cancelación: solicitar la eliminación de tus datos cuando ya no sean necesarios o hayas revocado tu consentimiento.", "Oposición: oponerte al tratamiento de tus datos para finalidades específicas, incluyendo las secundarias."],
            { emailText: "0323105874@ut-tijuana.edu.mx", v: "Para ejercer estos derechos, envía una solicitud a {email} indicando tu nombre completo, correo electrónico registrado, derecho que deseas ejercer y descripción de la solicitud. Responderemos en un plazo máximo de 20 días hábiles conforme a la LFPDPPP." }
          ]
        },
        {
          h: "10. Uso de Cookies",
          c: [
            "La Plataforma puede utilizar cookies para mejorar la experiencia del usuario, mantener sesiones activas y recopilar información de uso de forma agregada:",
            ["Cookies de sesión: necesarias para mantener tu sesión activa. Se eliminan al cerrar el navegador.", "Cookies de preferencias: almacenan configuraciones de usuario para personalizar la experiencia.", "Cookies analíticas: recopilan información estadística de uso de forma anonimizada."],
            "Puedes configurar tu navegador para rechazar o eliminar cookies. Deshabilitar las cookies de sesión puede impedir el correcto funcionamiento de la Plataforma."
          ]
        },
        {
          h: "11. Usuarios Menores de Edad",
          c: [
            "La creación de un perfil como Proveedor de servicios dentro de la Plataforma está reservada exclusivamente para personas mayores de 18 años con capacidad legal para celebrar contratos. Cualquier persona puede registrarse como Cliente sin restricción de edad; sin embargo, para activar el rol de Proveedor se requerirá confirmación de mayoría de edad. Servease no recopila intencionalmente datos de menores en contextos que impliquen obligaciones contractuales o prestación de servicios. Si detectamos una situación contraria, procederemos a gestionar la cuenta conforme a la normativa aplicable."
          ]
        },
        {
          h: "12. Cambios a esta Política",
          c: [
            "Servease se reserva el derecho de modificar esta Política en cualquier momento. Las modificaciones se notificarán a través de la Plataforma y/o por correo electrónico con al menos 10 días de anticipación a su entrada en vigor. El uso continuado de la Plataforma después de las modificaciones constituirá su aceptación."
          ]
        },
        {
          h: "13. Legislación Aplicable",
          c: [
            "La presente Política se rige por la Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP), su Reglamento, y los Lineamientos del Aviso de Privacidad publicados por el INAI, vigentes en los Estados Unidos Mexicanos."
          ]
        },
        {
          h: "14. Contacto",
          c: [
            { contact: true, email: "0323105874@ut-tijuana.edu.mx", institution: "Universidad Tecnológica de Tijuana", city: "Tijuana, Baja California, México" }
          ]
        }
      ]
    }
  }
};
