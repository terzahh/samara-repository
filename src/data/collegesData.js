const colleges = [
  {
    id: 1,
    name: 'College of Social Science and Humanity',
    description: 'Dedicated to producing competent, ethical, and well-trained graduates who can solve social, political, and economic challenges through applied research. The college fosters unity, peaceful coexistence, and harmony by promoting cultural and emotional understanding across Ethiopia\'s diverse communities.',
    mission: 'To contribute to the country\'s sustainable peace and development through quality education and research in Social Sciences and Humanities.',
    vision: 'A center of excellence in producing socially responsible graduates and advancing knowledge in humanities and social sciences.',
    website: 'https://su.edu.et/collage-of-social-science-and-humanity/',
    departments: [
      { name: 'Sociology', programs: ['Undergraduate'] },
      { name: 'Geography & Environmental Studies', programs: ['Undergraduate'] },
      { name: 'English Language & Literature', programs: ['Undergraduate'] },
      { name: 'History and Heritage Management', programs: ['Undergraduate'] },
      { name: 'Journalism and Communication', programs: ['Undergraduate'] }
    ],
    postgraduate: [
      'Disaster Risk Management and Pastoral Development',
      'Sociology',
      'Applied Linguistics and Communication in Afar Af'
    ],
    contact: { name: 'Habib Mohammed', title: 'Dean', email: 'cssh@su.edu.et', phone: '+251920700074' }
  },
  {
    id: 2,
    name: 'College of Dry Agriculture',
    description: 'One of the pioneer colleges at Samara University, playing a key role in producing skilled human resources in the dryland agriculture sector. With extensive faculty expertise and 133+ faculty members, the college conducts quality research targeting pastoral and agro-pastoral communities to improve their livelihoods.',
    mission: 'To produce skilled agricultural professionals equipped with knowledge to address dryland agriculture challenges and improve pastoral livelihoods.',
    vision: 'A leading center for dryland agricultural research, innovation, and community development.',
    website: 'https://su.edu.et/college-of-dry-land-agriculture/',
    departments: [
      { name: 'Agrobusiness Value chain Management', programs: ['Undergraduate'] },
      { name: 'Horticulture', programs: ['Undergraduate'] },
      { name: 'Plant Science', programs: ['Undergraduate'] },
      { name: 'Agriculture Economics', programs: ['Undergraduate'] },
      { name: 'Natural Resource Management', programs: ['Undergraduate'] },
      { name: 'Rural Development & Agricultural Extension', programs: ['Undergraduate'] }
    ],
    postgraduate: ['MSc in Dryland Agriculture'],
    contact: { name: 'Jemal Seid Endris', title: 'Dean', email: 'cda@su.edu.et', phone: '+251911111111' }
  },
  {
    id: 3,
    name: 'College of Natural and Computational Science',
    description: 'A pioneer college comprising six departments with 124+ dedicated faculty members, including eight Ph.D. holders. CNCS is committed to excellence in teaching, research, and community service, actively addressing the needs of pastoral and agro-pastoral communities through sustainable development initiatives.',
    mission: 'To produce skilled professionals in Physical Sciences, Biological Sciences, Computational Sciences, and Statistical Sciences.',
    vision: 'A center of excellence in natural and computational sciences research, innovation, and talent development.',
    website: 'https://su.edu.et/college-of-natural-computational-science/',
    departments: [
      { name: 'Sport Science', programs: ['Undergraduate'] },
      { name: 'Physics', programs: ['Undergraduate'] },
      { name: 'Mathematics', programs: ['Undergraduate'] },
      { name: 'Statistics', programs: ['Undergraduate'] },
      { name: 'Biology', programs: ['Undergraduate'] },
      { name: 'Chemistry', programs: ['Undergraduate'] }
    ],
    postgraduate: ['MSc in Computer Science', 'MSc in Physics'],
    contact: { name: 'Ataklti Abraha (PhD)', title: 'Dean', email: 'cncs@su.edu.et', phone: '+251911222222' }
  },
  {
    id: 4,
    name: 'College of Medical and Health Science',
    description: 'Provides an exceptional environment for teaching, learning, research, and community engagement, aiming to improve the health and well-being of people in the Afar region, Ethiopia, and beyond. Our students achieve a 100% pass rate in exit exams and licensure, reflecting our commitment to quality medical education.',
    mission: 'To transform health education, research, and care through diverse perspectives and community-centered approaches.',
    vision: 'A leading institution for health sciences education, research, and service to improve population health outcomes.',
    website: 'https://su.edu.et/college-of-medical-and-health-sciences/',
    departments: [
      { name: 'Nursing', programs: ['Undergraduate'] },
      { name: 'Midwifery', programs: ['Undergraduate'] },
      { name: 'Public Health', programs: ['Undergraduate', 'Postgraduate'] },
      { name: 'Biomedical Sciences', programs: ['Undergraduate'] },
      { name: 'School of Medicine', programs: ['Undergraduate'] }
    ],
    postgraduate: [
      'General Public Health',
      'Public Health in Nutrition',
      'Public Health in Reproductive Health'
    ],
    contact: { name: 'Ousman Ahmed (Assistant Professor in Tropical Medicine)', title: 'Dean', email: 'cmhs@su.edu.et', phone: '+251911333333' }
  },
  {
    id: 5,
    name: 'College of Business and Economics',
    description: 'Provides comprehensive education in business disciplines, equipping students with skills for today\'s competitive job market. CBE emphasizes practical experience through internships and real-world projects, fosters strong alumni networks, and integrates global perspectives with entrepreneurship into its curricula.',
    mission: 'To produce ethical, innovative business leaders and economists capable of driving sustainable economic development.',
    vision: 'A dynamic hub for business education, entrepreneurship, and economic innovation serving regional and global markets.',
    website: 'https://su.edu.et/collage-of-business-and-economics/',
    departments: [
      { name: 'Accounting and Finance', programs: ['Undergraduate', 'Postgraduate'] },
      { name: 'Economics', programs: ['Undergraduate', 'Postgraduate'] },
      { name: 'Management', programs: ['Undergraduate'] },
      { name: 'Marketing Management', programs: ['Undergraduate', 'Postgraduate'] },
      { name: 'Logistics and Supply Chain Management', programs: ['Undergraduate'] }
    ],
    postgraduate: [
      'Accounting and Finance',
      'Development Economics',
      'Business Administration',
      'Marketing Management',
      'Project Planning and Management'
    ],
    contact: { name: 'Aden Mohammed Ebad', title: 'Dean', email: 'cbe@su.edu.et', phone: '+251911003831' }
  },
  {
    id: 6,
    name: 'College of Veterinary Medicine',
    description: 'Specializes in veterinary medicine and animal science, training professionals committed to animal health, welfare, and productivity. The college conducts research and provides services supporting livestock development in pastoral communities.',
    mission: 'To produce competent veterinary professionals and animal scientists advancing livestock development and public health.',
    vision: 'A center of excellence in veterinary sciences and animal agriculture research and education.',
    website: 'https://su.edu.et/collage-of-veterinary-medicine-and-animal-science/',
    departments: [
      { name: 'Veterinary Medicine', programs: ['Undergraduate'] },
      { name: 'Animal Science', programs: ['Undergraduate'] }
    ],
    postgraduate: ['Veterinary Public Health'],
    contact: { name: 'TBD', title: 'Dean', email: 'cvmv@su.edu.et', phone: '+251911444444' }
  },
  {
    id: 7,
    name: 'College of Engineering and Technology',
    description: 'Dedicated to producing engineers and technologists equipped with knowledge and skills to address development challenges. The college emphasizes practical training, research, and innovation to solve real-world engineering problems.',
    mission: 'To produce skilled engineers capable of developing sustainable infrastructure and technological solutions.',
    vision: 'A leading engineering education and research center driving technological innovation and development.',
    website: 'https://su.edu.et/collage-of-engineering-and-technology/',
    departments: [
      { name: 'Civil Engineering', programs: ['Undergraduate'] },
      { name: 'Chemical Engineering', programs: ['Undergraduate'] },
      { name: 'Computer Science', programs: ['Undergraduate', 'Postgraduate'] },
      { name: 'Information Technology', programs: ['Undergraduate'] },
      { name: 'Mechanical Engineering', programs: ['Undergraduate'] },
      { name: 'Electrical & Computer Engineering', programs: ['Undergraduate'] },
      { name: 'Construction Technology Management', programs: ['Undergraduate'] },
      { name: 'Water Resource & Irrigation Engineering', programs: ['Undergraduate'] }
    ],
    postgraduate: [
      'Computer Science',
      'Road and Transport Studies',
      'Structural Engineering'
    ],
    contact: { name: 'TBD', title: 'Dean', email: 'cet@su.edu.et', phone: '+251911555555' }
  },
  {
    id: 8,
    name: 'School of Tourism and Hospitality Management',
    description: 'Prepares professionals for the thriving tourism and hospitality industry, with emphasis on sustainable tourism development and quality service management. Students gain practical experience in resort and hospitality operations.',
    mission: 'To produce hospitality and tourism professionals advancing sustainable tourism development and economic growth.',
    vision: 'A premier institution for tourism and hospitality education fostering sustainable industry development.',
    website: 'https://su.edu.et/school-of-tourism-hospitality-management-2/',
    departments: [
      { name: 'Tourism and Hospitality Management', programs: ['Undergraduate'] }
    ],
    postgraduate: ['MSc in Tourism Management'],
    contact: {
      name: 'Abraha Haftom (PhD)',
      title: 'Dean',
      email: 'sthm@su.edu.et',
      phone: '+251923750448'
    }
  },
  {
    id: 9,
    name: 'School of Law and Governance',
    description: 'Focuses on legal education and governance studies, training professionals who understand constitutional law, human rights, and democratic governance. The school prepares graduates for careers in law, government, and civil society organizations.',
    mission: 'To produce ethical legal professionals and governance experts promoting justice, rule of law, and democratic values.',
    vision: 'A leading institution for legal and governance education advancing justice and democratic development.',
    website: 'https://su.edu.et/school-of-law-and-governance-2/',
    departments: [
      { name: 'Law and Governance', programs: ['Undergraduate'] }
    ],
    postgraduate: ['LLM', 'MA in Governance'],
    contact: { name: 'TBD', title: 'Dean', email: 'slg@su.edu.et', phone: '+251911666666' }
  },
  {
    id: 10,
    name: 'School of Earth Science',
    description: 'Offers comprehensive programs in geology and environmental science, training professionals to understand and manage natural resources sustainably. The school conducts research addressing geological hazards and environmental challenges.',
    mission: 'To produce earth scientists and environmental professionals advancing sustainable resource management.',
    vision: 'A leading center for earth sciences education and research supporting sustainable development.',
    website: 'https://su.edu.et/school-of-earth-science-2/',
    departments: [
      { name: 'Earth Science', programs: ['Undergraduate'] }
    ],
    postgraduate: ['MSc in Geology'],
    contact: {
      name: 'Getachew Geretsadkan',
      title: 'School Dean',
      email: 'getachewgebretsadik@su.edu.et',
      phone: '+251-914-782-422'
    }
  }
];

export default colleges;
