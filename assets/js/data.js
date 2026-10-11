/* Données des projets — modifier ici pour ajouter / corriger un projet.
   cover / images : nom du fichier dans assets/img (sans "-sm" ni ".webp"), ou un fichier .svg */
window.PROJECTS = [
  {
    id: 'exail', featured: true, cat: 'elec',
    title: 'Stage — Exail Quantum Systems',
    short: 'Alimentation bas bruit ±6 V / ±18 V et synthétiseur de fréquence AOM à base de DDS.',
    year: '2026', frame: 'Stage · Gradignan', duration: 'Avril – juin 2026', role: 'Stagiaire en électronique',
    cover: 'exail-1', alt: 'Baie électronique Exail réalisée pendant le stage',
    images: ['exail-1', 'exail-9', 'exail-12', 'exail-11', 'exail-2', 'exail-3', 'exail-4', 'exail-5', 'exail-6', 'exail-7', 'exail-8', 'exail-10'],
    figures: [
      { v: 230, u: 'V', l: 'entrée secteur des bancs de test' },
      { v: 4, u: '', l: 'sorties RF du synthétiseur AOM' },
      { v: 18, p: '±', u: 'V', l: 'rails d’alimentation bas bruit' },
      { v: 6, p: '±', u: 'V', l: 'rails d’alimentation bas bruit' }
    ],
    context: 'Chez Exail Quantum Systems, j’ai intégré des systèmes de bancs de tests à partir d’une prise secteur 230 V, destinés à alimenter et piloter des systèmes optiques de précision.',
    missions: [
      'Concevoir une alimentation bas bruit délivrant ±6 V et ±18 V pour des systèmes optiques',
      'Réaliser un synthétiseur de fréquence AOM basé sur une DDS, piloté par une Raspberry Pi',
      'Intégrer le synthétiseur dans son boîtier : horloge DDS et 4 sorties RF en SMA (AOM0, AOM1, Cooler, Repumper), entrée de commande, pilotage réseau en Telnet, alimentation +6 V',
      'Assembler mécaniquement un régénérateur laser (RLS)',
      'Câbler, vérifier et livrer des baies conformes à la production'
    ],
    skills: ['Lecture de schémas 3D', 'Câble management', 'RF', 'Électronique de précision', 'Vie en entreprise'],
    tools: ['DDS', 'AOM', 'Raspberry Pi', 'Connecteurs SMA', 'Telnet', 'Multimètre', 'Alimentations de laboratoire'],
    docs: []
  },
  {
    id: 'sql', featured: false, cat: 'data', isNew: true,
    title: 'Base de données Northwind — SQL & Python',
    short: 'Administrer une base MySQL, écrire requêtes et vues, puis les exploiter dans un script Python.',
    year: '2026', frame: 'BUT 3 · Ressource Base de données', duration: 'TP, séances 1 à 5', role: 'Travail individuel',
    cover: 'sql.svg', alt: 'Schéma relationnel de la base Northwind',
    images: ['sql.svg'],
    terminal: true,
    figures: [
      { v: 77, u: '', l: 'produits dans la base' },
      { v: 8, u: '', l: 'catégories analysées' },
      { v: 518, u: '', l: 'lignes dans la vue v_stat_produit' }
    ],
    context: 'Série de TP sur un serveur MariaDB / MySQL (Debian, accès SSH) : création et administration d’une base, puis analyse rétroactive de Northwind, la modélisation d’une centrale d’achat où des clients passent des commandes.',
    missions: [
      'Créer une base et attribuer les droits d’un utilisateur (CREATE DATABASE, GRANT)',
      'Tester l’intégrité : clés primaires et clés étrangères',
      'Importer des fichiers CSV, sauvegarder et restaurer la base avec mysqldump',
      'Retrouver le modèle de Northwind par ingénierie inverse (concepteur phpMyAdmin)',
      'Écrire des requêtes : jointures, GROUP BY, COUNT / MIN / MAX, DATE_FORMAT, LIMIT',
      'Créer les vues v_stat_produit et v_stat_annee (chiffre d’affaires par produit et par année)',
      'Développer un menu console en Python (mysql.connector) : catégories, recherche LIKE, statistiques de ventes',
      'Construire un tableau croisé dynamique à partir d’un export CSV'
    ],
    skills: ['Modélisation relationnelle', 'Requêtes SQL', 'Vues', 'Scripts Python', 'Administration'],
    tools: ['MySQL / MariaDB', 'phpMyAdmin', 'Python', 'mysql.connector', 'SSH · Debian'],
    docs: []
  },
  {
    id: 'radio', featured: true, cat: 'rf',
    title: 'Radiogoniométrie — antenne HB9CV',
    short: 'Une antenne directionnelle accordée à 144 MHz pour une chasse au renard sur le campus.',
    year: '2026', frame: 'SAÉ4 · GEII ESE', duration: 'Mars 2026', role: 'Projet en équipe',
    cover: 'radio-1', alt: 'Antenne HB9CV 144 MHz posée sur une table, tablette SDR au premier plan',
    images: ['radio-1', 'radio-2'],
    figures: [
      { v: 144, u: 'MHz', l: 'fréquence de résonance' }
    ],
    context: 'Lors d’un événement organisé par l’IUT de Bordeaux, chaque groupe a construit son antenne pour une compétition de « chasse au renard » : retrouver des balises radio cachées sur le campus grâce à la radiogoniométrie.',
    missions: [
      'Construire une antenne HB9CV résonnant à 144 MHz',
      'Ajuster l’adaptation d’impédance à l’aide de l’abaque de Smith',
      'Mesurer et valider l’antenne au VNA',
      'Localiser les balises avec une radio logicielle (SDR) et GNU Radio'
    ],
    skills: ['Construction mécanique', 'Abaque de Smith', 'Adaptation d’impédance', 'Radiogoniométrie'],
    tools: ['VNA', 'SDR', 'GNU Radio'],
    docs: []
  },
  {
    id: 'vna', featured: true, cat: 'rf',
    title: 'Datasheet RF — diviseur de Wilkinson',
    short: 'Caractériser au VNA un composant RF inconnu, puis en rédiger la datasheet.',
    year: '2026', frame: 'Électronique RF · BUT 2', duration: 'Mars 2026', role: 'Binôme avec Dionísio Hebo',
    cover: 'vna-1', alt: 'Diviseur de Wilkinson en technologie microruban dans son boîtier',
    images: ['vna-1', 'vna-2', 'vna-3', 'vna-4', 'vna-5', 'vna-6'],
    figures: [
      { v: -3.56, d: 2, u: 'dB', l: 'S21 mesuré au VNA' },
      { v: 1.3, d: 1, u: 'GHz', l: 'borne haute de la bande (300 kHz – 1,3 GHz)' },
      { v: 50, u: 'Ω', l: 'impédance nominale sur les trois ports' }
    ],
    context: 'Sans information préalable, nous avons caractérisé plusieurs dispositifs RF (atténuateur 3 dB, diviseur de Wilkinson, filtre passe-bas) à l’analyseur de réseau vectoriel, puis rédigé la datasheet complète du diviseur de Wilkinson.',
    missions: [
      'Calibrer le VNA avec la procédure SOLT (Short, Open, Load, Thru)',
      'Mesurer les paramètres S et l’impédance sur l’abaque de Smith',
      'Simuler le circuit microruban sous Usimics et comparer mesure et simulation',
      'Rédiger une datasheet technique et un compte rendu de 12 pages'
    ],
    skills: ['Paramètres S', 'Abaque de Smith', 'Lignes λ/4 microruban', 'Rédaction technique'],
    tools: ['VNA', 'Usimics', 'Kit de calibration SOLT'],
    docs: [
      { label: 'Datasheet — diviseur de Wilkinson', href: 'assets/pdf/datasheet-wilkinson.pdf' },
      { label: 'Compte rendu VNA', href: 'assets/pdf/compte-rendu-vna.pdf' }
    ]
  },
  {
    id: 'coffre', featured: true, cat: 'rf',
    title: 'Coffre-fort — analyse & rejeu de signal',
    short: 'Intercepter, démoduler et reconstituer la trame d’une clé électronique.',
    year: '2026', frame: 'Sécurité embarquée · BUT 2', duration: 'Mars 2026', role: 'Projet en équipe',
    cover: 'coffre-1', alt: 'Coffre-fort de laboratoire ouvert à côté d’une HackRF One',
    images: ['coffre-1', 'coffre-2', 'coffre-3', 'coffre-4'],
    figures: [],
    context: 'Étude de la sécurité d’un coffre-fort de laboratoire : en analysant le signal radio émis par sa clé électronique, nous avons démontré qu’il était possible de le reproduire pour déclencher l’ouverture.',
    missions: [
      'Capter le signal de la clé avec une radio logicielle (HackRF One)',
      'Observer le spectre à l’analyseur de spectre',
      'Démoduler, isoler et analyser la trame émise',
      'Reconstituer la trame à l’identique et la renvoyer pour déverrouiller le coffre'
    ],
    skills: ['Modulation / démodulation', 'Analyse de trame', 'Sécurité embarquée', 'Traitement du signal'],
    tools: ['HackRF One', 'Analyseur de spectre R&S FSP'],
    docs: []
  },
  {
    id: 'geo', featured: false, cat: 'embed',
    title: 'Géolocalisation — distance entre cartes',
    short: 'Une communication client / serveur entre cartes pour mesurer la distance qui les sépare.',
    year: '2026', frame: 'Systèmes communicants · BUT 2', duration: 'Mars 2026', role: 'Projet en équipe',
    cover: 'geo-1', alt: 'Deux cartes électroniques séparées par un mètre ruban',
    images: ['geo-1', 'geo-2', 'geo-3'],
    figures: [],
    context: 'Développement d’un système de suivi et de géolocalisation en temps réel, validé au mètre ruban sur la paillasse.',
    missions: [
      'Mettre en place une communication client / serveur entre cartes STM32',
      'Déterminer précisément la distance qui sépare les cartes',
      'Intégrer des modules GPS et transmettre les données',
      'Visualiser les coordonnées sur une interface cartographique'
    ],
    skills: ['Systèmes communicants', 'IoT', 'Validation expérimentale'],
    tools: ['STM32', 'GPS', 'Client / serveur'],
    docs: []
  },
  {
    id: 'drone', featured: true, cat: 'auto',
    title: 'Drone Parrot — modélisation & PID',
    short: 'Identifier la dynamique d’un drone, régler ses correcteurs PID et le piloter via son jumeau numérique.',
    year: '2025', frame: 'AOP S3 · GEII ESE', duration: 'Semestre 3 · BUT 2', role: 'Compte rendu individuel · groupe B1',
    cover: 'drone.svg', alt: 'Schéma du drone, de sa réponse indicielle et de sa boucle PID',
    images: ['drone.svg', 'drone-1', 'drone-2', 'drone-3', 'drone-4', 'drone-5', 'drone-6', 'drone-7', 'drone-8'],
    figures: [
      { v: 0.7, d: 1, u: 's', l: 'retard pur identifié (Wi-Fi + motorisation)' },
      { v: 70, u: 'ms', l: 'période d’échantillonnage du correcteur numérique' },
      { v: 2.94, d: 2, u: 's', l: 'constante de temps de l’axe roll' }
    ],
    context: 'AOP du semestre 3 sur le drone Parrot Bebop 2, dans une transition vers le Parrot Anafi : modéliser sa dynamique, synthétiser ses correcteurs et exploiter l’hyperréalité, c’est-à-dire la synchronisation permanente entre le drone réel et son jumeau numérique 3D.',
    missions: [
      'Réaliser des essais indiciels en boucle ouverte (échelon de commande) et exporter les mesures en CSV',
      'Identifier les axes pitch et roll sous MATLAB : tfest, modèle « boîte noire » à 6 pôles et 4 zéros, retard pur de 0,7 s',
      'Corriger l’offset initial des mesures et calculer gain statique et constante de temps (roll : K = 61,23 ; τ = 2,94 s)',
      'Calculer les correcteurs PID avec pidtune puis les discrétiser (c2d) à la période de 70 ms',
      'Analyser l’architecture réseau en Python : serveur UDP (port 22000) et serveur TCP multithread',
      'Proposer des évolutions de l’hyperréalité : champs de potentiel, retour de force, commande prédictive (MPC)'
    ],
    skills: ['Identification de systèmes', 'Correcteur PID', 'Discrétisation', 'Réseaux UDP / TCP', 'Jumeau numérique'],
    tools: ['MATLAB', 'Python', 'Parrot Bebop 2 / Anafi', 'Supervision Visual Basic'],
    docs: [
      { label: 'Compte rendu AOP drones', href: 'assets/pdf/compte-rendu-aop-drones.pdf' }
    ]
  },
  {
    id: 'sumo', featured: true, cat: 'embed',
    title: 'Robot Sumo autonome',
    short: 'Concevoir de zéro un robot de combat à partir d’un cahier des charges.',
    year: '2025', frame: 'SAÉ3 · GEII ESE', duration: 'BUT 2 · 2025 – 2026', role: 'Projet en équipe',
    cover: 'sumo-2', alt: 'Prototype du robot sumo branché sur sa platine d’essai',
    images: ['sumo-2', 'sumo-3'],
    figures: [],
    context: 'Projet de deuxième année : concevoir un robot sumo à partir de zéro, dans le respect d’un cahier des charges, pour affronter les robots des autres équipes sur le dohyo.',
    missions: [
      'Analyser le cahier des charges et sélectionner les composants (fiches techniques)',
      'Programmer le robot en C++ sur Arduino',
      'Détecter l’adversaire avec des capteurs à ultrasons',
      'Router la carte de puissance (pont en H) sous KiCad',
      'Concevoir le châssis en impression 3D'
    ],
    skills: ['Travail d’équipe', 'Recherche documentaire', 'Esprit de synthèse'],
    tools: ['Arduino', 'C++', 'KiCad', 'Impression 3D'],
    docs: []
  },
  {
    id: 'stm32', featured: false, cat: 'embed',
    title: 'Signal sonore sur STM32',
    short: 'Générer puis modifier un signal sonore avec un microcontrôleur.',
    year: '2025', frame: 'SAÉ3 · GEII ESE', duration: 'BUT 2 · 2025', role: 'Projet en équipe',
    cover: 'stm32-1', alt: 'Carte STM32 reliée à un smartphone qui enregistre le signal sonore',
    images: ['stm32-1', 'stm32-2', 'stm32-3'],
    figures: [],
    context: 'Projet de deuxième année : produire un signal audio depuis une carte STM32 et en modifier les caractéristiques.',
    missions: [
      'Générer des signaux carré, sinus et triangle avec les timers et le DAC',
      'Modifier en temps réel le signal sonore produit par la carte',
      'Programmer en C bas niveau, configuration avec STM32CubeMX',
      'Appliquer les notions mathématiques du traitement du signal'
    ],
    skills: ['Programmation microcontrôleur', 'Traitement du signal'],
    tools: ['STM32', 'C', 'CubeMX'],
    docs: []
  },
  {
    id: 'rpi', featured: false, cat: 'embed',
    title: 'Bras robotisé — Raspberry Pi',
    short: 'Piloter un bras robotisé depuis une Raspberry Pi sous Linux.',
    year: '2025', frame: 'SAÉ3 · GEII ESE', duration: 'BUT 2 · 2025', role: 'Travail en autonomie',
    cover: 'rpi.svg', alt: 'Schéma du bras robotisé piloté par une Raspberry Pi',
    images: ['rpi.svg', 'rpi-2'],
    figures: [],
    context: 'Projet d’informatique industrielle de deuxième année : commander un bras robotisé depuis une Raspberry Pi sous Linux.',
    missions: [
      'Programmer le bras robotisé en Python sous Linux',
      'Communiquer en liaison série avec la carte de commande (/dev/ttyUSB0)',
      'Prendre en main Linux et les architectures réseau'
    ],
    skills: ['Python', 'Linux', 'Architectures réseau', 'Autonomie'],
    tools: ['Raspberry Pi', 'Python', 'C', 'Liaison série'],
    docs: []
  },
  {
    id: 'carte', featured: true, cat: 'elec',
    title: 'Carte de signalisation pour robot mobile',
    short: 'De la schématique à la carte gravée, soudée et testée : mon premier PCB.',
    year: '2025', frame: 'SAÉ1 & SAÉ2 · IUT de Rouen', duration: 'BUT 1 · 2024 – 2025', role: 'Projet individuel',
    cover: 'carte-1', alt: 'Routage KiCad de la carte de signalisation',
    images: ['carte-1', 'carte-2', 'carte-3', 'carte-4', 'carte-5', 'carte-6', 'carte-7', 'carte-8', 'carte-9'],
    videos: [
      { src: 'assets/video/fab-gravure.mp4', poster: 'assets/video/fab-gravure-poster.webp', step: '03', tag: 'gravure', label: 'Insolation & gravure de la carte' },
      { src: 'assets/video/fab-test.mp4', poster: 'assets/video/fab-test-poster.webp', step: '05', tag: 'test', label: 'Test sous tension, sondes en place' }
    ],
    videosNote: 'Deux étapes de la fabrication, filmées pendant la SAÉ : la plaque passe à la gravure, puis la carte est testée sous tension, sondes en place.',
    figures: [
      { v: 5, u: 'V', l: 'alimentation régulée (L7805)' },
      { v: 20, u: 'p.', l: 'de rapport technique' }
    ],
    context: 'Carte électronique de signalisation destinée à un robot mobile : niveau de batterie indiqué par LEDs, tension et vitesse des roues affichées sur un écran LCD I2C, alimentation régulée 5 V.',
    missions: [
      'Suivre un cahier des charges et planifier le projet (diagramme de Gantt)',
      'Étudier chaque fonction : régulateur L7805, comparateurs TL082, portes NAND à trigger de Schmitt, transistors PN2222A',
      'Simuler l’oscillateur astable sous PSpice',
      'Router la carte sous KiCad en respectant les contraintes imposées (faces, empreintes, diamètres des pastilles)',
      'Fabriquer la carte : impression, insolation, gravure, perçage, soudure',
      'Tester au multimètre et à l’oscilloscope, puis l’implanter sur un robot suiveur de ligne programmé sous Arduino',
      'Rédiger le rapport technique de fonctionnement et de dépannage'
    ],
    skills: ['Analyse fonctionnelle', 'Routage PCB', 'Fabrication', 'Procédure de test'],
    tools: ['KiCad', 'PSpice', 'Arduino', 'Oscilloscope', 'Multimètre'],
    docs: [
      { label: 'Rapport technique SAÉ2', href: 'assets/pdf/rapport-sae2-carte.pdf' }
    ]
  },
  {
    id: 'fpga', featured: false, cat: 'elec',
    title: 'Circuit logique sur FPGA — VHDL',
    short: 'Décrire, simuler et déployer un circuit logique sur un FPGA Altera.',
    year: '2025', frame: 'SAÉ2 · IUT de Rouen', duration: 'BUT 1 · 2025', role: 'Travail en groupe',
    cover: 'fpga.svg', alt: 'Chronogramme et blocs logiques d’un circuit VHDL',
    images: ['fpga.svg'],
    figures: [],
    context: 'Programmation en VHDL d’un circuit logique, de sa description jusqu’au déploiement sur une carte FPGA Altera.',
    missions: [
      'Décrire le circuit en VHDL',
      'Simuler son comportement sous ModelSim',
      'Compiler, synthétiser et déployer sur cible matérielle avec Quartus',
      'Dimensionner un affichage 7 segments multiplexé (feuille de calculs)'
    ],
    skills: ['Logique numérique', 'Simulation', 'Synthèse'],
    tools: ['VHDL', 'Quartus', 'ModelSim', 'FPGA Altera'],
    docs: [
      { label: 'Feuille de calculs — affichage multiplexé', href: 'assets/pdf/calculs-affichage-multiplexe.pdf' }
    ]
  },
  {
    id: 'auto', featured: false, cat: 'auto',
    title: 'Automatisme & armoires électriques',
    short: 'Grafcet, câblage d’armoires et départs moteurs asynchrones.',
    year: '2025', frame: 'BUT 1 · IUT de Rouen', duration: '2024 – 2025', role: 'Travaux pratiques',
    cover: 'auto-1', alt: 'Platine de câblage électrique en régime IT',
    images: ['auto-1', 'auto-2', 'auto-3', 'auto-4'],
    figures: [],
    context: 'Travaux pratiques d’électrotechnique et d’automatisme : du schéma électrique industriel au câblage, puis à la programmation d’automates.',
    missions: [
      'Lire et réaliser des schémas électriques industriels',
      'Câbler des armoires électriques et des départs moteurs asynchrones',
      'Programmer des automates en Grafcet et en Ladder sous Automgen',
      'Travailler en sécurité (préhabilitation électrique)'
    ],
    skills: ['Schéma électrique', 'Câblage', 'Grafcet', 'Ladder', 'Préhabilitation électrique'],
    tools: ['Automgen', 'Automate programmable', 'Régime IT'],
    docs: []
  }
];

window.PROJECT_CATS = {
  all: 'Tous',
  elec: 'Électronique',
  rf: 'RF & signal',
  embed: 'Embarqué',
  auto: 'Automatisme',
  data: 'Données'
};

/* Éditorial noir & blanc (assets/img/edito/edito-NN.webp) — séance du 23 mai 2026 */
window.EDITO = [
  { file: 'edito-01', alt: 'Portrait de face en noir et blanc, chemise rayée et foulard' },
  { file: 'edito-02', alt: 'Profil en noir et blanc, veste de costume et chemise rayée' },
  { file: 'edito-03', alt: 'Profil en noir et blanc, manteau et gilet pied-de-poule' },
  { file: 'edito-04', alt: 'Silhouette en pied, blazer clair et short' },
  { file: 'edito-05', alt: 'Trois-quarts en noir et blanc, regard baissé' },
  { file: 'edito-06', alt: 'Gros plan en noir et blanc, regard vers l’objectif' }
];
