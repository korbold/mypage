export type Lang = 'en' | 'es';

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    'nav.services': 'Services',
    'nav.work': 'Work',
    'nav.tech': 'Tech',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',

    // Hero
    'hero.headline': 'I build mobile apps & cloud backends that ship fast and scale.',
    'hero.subheadline': 'Mobile apps, backends & cloud for startups and enterprises.',
    'hero.cta.work': 'See my work',
    'hero.cta.contact': "Let's talk",

    // Services
    'services.title': 'What I do',
    'services.mobile.title': 'Mobile Apps',
    'services.mobile.desc': 'End-to-end Flutter apps for iOS & Android. Clean architecture, Firebase, App Store deployment.',
    'services.backend.title': 'Backend & APIs',
    'services.backend.desc': 'Scalable APIs with NestJS/Node.js. Auth with OAuth2/Keycloak, Docker, CI/CD pipelines.',
    'services.cloud.title': 'Cloud & DevOps (AWS)',
    'services.cloud.desc': 'Production-grade AWS infrastructure: ECS, EKS, Lambda, Aurora, RDS. High availability by default.',

    // Case Studies
    'cases.title': 'Completed Work',
    'cases.view': 'View case study',

    // Current Projects
    'current.title': 'Current Projects',
    'current.mobile': 'Mobile Support',
    'current.web': 'Web Development',
    'current.mydessk.desc': 'Electronic invoicing & sales management platform',
    'current.reventi.desc': 'Online marketplace for buying & selling locally',

    // Tech Stack
    'tech.title': 'Tech Stack',
    'tech.mobile': 'Mobile',
    'tech.backend': 'Backend',
    'tech.auth': 'Auth',
    'tech.cloud': 'Cloud AWS',
    'tech.devops': 'DevOps',
    'tech.frontend': 'Frontend',
    'tech.databases': 'Databases',

    // Blog
    'blog.title': 'Latest Posts',
    'blog.readall': 'Read all posts',
    'blog.readmore': 'Read more',

    // Testimonials
    'testimonials.title': 'What people say',
    'testimonials.quote': 'Danny delivered the Flutter modules on time, with clean code and great communication throughout the project.',
    'testimonials.author': 'Tech Lead, Kruger Corp',

    // Contact
    'contact.title': 'Got a project in mind? Let\'s build it.',
    'contact.subtitle': "I'm available for freelance projects \u2014 mobile apps, backends, cloud infrastructure, or all three.",
    'contact.email': 'Email',
    'contact.linkedin': 'LinkedIn',
    'contact.github': 'GitHub',
    'contact.whatsapp': 'WhatsApp',

    // Footer
    'footer.rights': 'All rights reserved.',

    // Detail pages
    'detail.back.cases': 'Back to work',
    'detail.back.blog': 'Back to blog',
    'detail.role': 'Role',
    'detail.period': 'Period',
    'detail.problem': 'The Problem',
    'detail.solution': 'The Solution',
    'detail.result': 'The Result',
    'detail.tech': 'Technologies',
  },
  es: {
    // Nav
    'nav.services': 'Servicios',
    'nav.work': 'Trabajo',
    'nav.tech': 'Tech',
    'nav.blog': 'Blog',
    'nav.contact': 'Contacto',

    // Hero
    'hero.headline': 'Construyo apps m\u00f3viles y backends en la nube que llegan a producci\u00f3n y escalan.',
    'hero.subheadline': 'Apps m\u00f3viles, backends y cloud para startups y empresas.',
    'hero.cta.work': 'Ver mi trabajo',
    'hero.cta.contact': 'Hablemos',

    // Services
    'services.title': 'Lo que hago',
    'services.mobile.title': 'Apps M\u00f3viles',
    'services.mobile.desc': 'Apps Flutter completas para iOS y Android. Arquitectura limpia, Firebase y despliegue en tiendas.',
    'services.backend.title': 'Backend & APIs',
    'services.backend.desc': 'APIs escalables con NestJS/Node.js. Auth con OAuth2/Keycloak, Docker y pipelines CI/CD.',
    'services.cloud.title': 'Cloud & DevOps (AWS)',
    'services.cloud.desc': 'Infraestructura AWS lista para producci\u00f3n: ECS, EKS, Lambda, Aurora, RDS. Alta disponibilidad por defecto.',

    // Case Studies
    'cases.title': 'Trabajos Realizados',
    'cases.view': 'Ver caso de estudio',

    // Current Projects
    'current.title': 'Proyectos Actuales',
    'current.mobile': 'Soporte M\u00f3vil',
    'current.web': 'Desarrollo Web',
    'current.mydessk.desc': 'Plataforma de facturaci\u00f3n electr\u00f3nica y gesti\u00f3n de ventas',
    'current.reventi.desc': 'Marketplace de compra y venta local',

    // Tech Stack
    'tech.title': 'Stack Tecnol\u00f3gico',
    'tech.mobile': 'M\u00f3vil',
    'tech.backend': 'Backend',
    'tech.auth': 'Auth',
    'tech.cloud': 'Cloud AWS',
    'tech.devops': 'DevOps',
    'tech.frontend': 'Frontend',
    'tech.databases': 'Bases de Datos',

    // Blog
    'blog.title': '\u00daltimos Posts',
    'blog.readall': 'Ver todos los posts',
    'blog.readmore': 'Leer m\u00e1s',

    // Testimonials
    'testimonials.title': 'Lo que dicen',
    'testimonials.quote': 'Danny entreg\u00f3 los m\u00f3dulos Flutter a tiempo, con c\u00f3digo limpio y excelente comunicaci\u00f3n durante todo el proyecto.',
    'testimonials.author': 'Tech Lead, Kruger Corp',

    // Contact
    'contact.title': '\u00bfTienes un proyecto? Construy\u00e1moslo juntos.',
    'contact.subtitle': 'Estoy disponible para proyectos freelance \u2014 apps m\u00f3viles, backends, infraestructura cloud, o los tres.',
    'contact.email': 'Email',
    'contact.linkedin': 'LinkedIn',
    'contact.github': 'GitHub',
    'contact.whatsapp': 'WhatsApp',

    // Footer
    'footer.rights': 'Todos los derechos reservados.',

    // Detail pages
    'detail.back.cases': 'Volver al trabajo',
    'detail.back.blog': 'Volver al blog',
    'detail.role': 'Rol',
    'detail.period': 'Per\u00edodo',
    'detail.problem': 'El Problema',
    'detail.solution': 'La Soluci\u00f3n',
    'detail.result': 'El Resultado',
    'detail.tech': 'Tecnolog\u00edas',
  },
};
