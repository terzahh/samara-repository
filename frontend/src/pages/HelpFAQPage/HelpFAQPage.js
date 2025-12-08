import React from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import './HelpFAQPage.css';

const HelpFAQPage = () => {
  const faqs = [
    {
      question: 'How do I upload a thesis or project?',
      answer: 'To upload a thesis or project, you must be a Department Head. Log in to your account and navigate to your Department Dashboard. Click on the "Upload Research" button and fill in all required fields including title, author, department, type, year, abstract, and keywords. Select the research file (PDF, DOC, or DOCX format) and click "Upload Research". You can also save your work as a draft to complete later.'
    },
    {
      question: 'What file formats are accepted?',
      answer: 'The repository accepts research files in the following formats: PDF (Portable Document Format), DOC (Microsoft Word 97-2003), and DOCX (Microsoft Word 2007 and later). The maximum file size is 10MB. Please ensure your file is not corrupted and is readable before uploading.'
    },
    {
      question: 'How do I search effectively?',
      answer: 'You can search for research using the search bar in the navigation menu. Enter keywords related to the title, author, abstract, or keywords of the research you are looking for. You can also use the Browse page to filter research by department, type, year, and access level. For more specific results, combine multiple search terms and use the advanced filters available on the Browse page.'
    },
    {
      question: 'Who can access restricted files?',
      answer: 'Restricted files are only accessible to authorized users who have logged in to the system. Access to restricted files is typically granted to students, faculty, and researchers affiliated with Samara University. If you need access to a restricted file, please contact the repository administrator or the department head responsible for the research.'
    },
    {
      question: 'How do I download a research paper?',
      answer: 'To download a research paper, navigate to the research detail page by clicking on the title of the research you are interested in. If the research is public, you will see a "Download" button. For restricted files, you must be logged in and authorized to access the file. Click the download button to save the file to your device.'
    },
    {
      question: 'How do I register as a Department Head?',
      answer: 'To register as a Department Head, go to the Sign Up page and select "Register as Department Head (Requires Admin Approval)". Fill in all required information including your name, email, password, and select your department. Your registration will be pending admin approval. Once approved by an administrator, you will be able to log in and manage research for your department.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'If you have forgotten your password, go to the Login page and click on "Forgot Password". Enter your email address and you will receive instructions on how to reset your password. If you are already logged in, you can change your password from your Profile page under the "Change Password" tab.'
    },
    {
      question: 'What is the difference between public and restricted access?',
      answer: 'Public access means the research is freely available to anyone visiting the repository, including non-authenticated users. Restricted access means the research is only available to logged-in, authorized users. Authors and department heads can choose the access level when uploading research.'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can contact the repository support team by visiting the Contact page and filling out the contact form. Include your name, email, subject, and a detailed message describing your issue or question. You can also reach out to your department head or the repository administrator directly. For technical issues, please include as much detail as possible about the problem you are experiencing.'
    },
    {
      question: 'Can I edit or delete my uploaded research?',
      answer: 'Yes, if you are a Department Head, you can edit or delete research that you have uploaded. Navigate to your Department Dashboard and find the research in the list. Click the edit icon to modify the research details or file. To delete research, contact the repository administrator as deletion may require special permissions.'
    }
  ];

  return (
    <div className="help-faq-page">
      <Container className="py-5">
        <Row>
          <Col md={12}>
            <div className="page-header text-center mb-5">
              <h1 className="page-title">
                <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                Help & FAQ
              </h1>
              <p className="page-subtitle">
                Find answers to common questions and learn how to use the repository
              </p>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card className="faq-card">
              <Card.Header as="h3">Frequently Asked Questions</Card.Header>
              <Card.Body>
                <Accordion defaultActiveKey="0">
                  {faqs.map((faq, index) => (
                    <Accordion.Item eventKey={index.toString()} key={index}>
                      <Accordion.Header>{faq.question}</Accordion.Header>
                      <Accordion.Body>
                        <p>{faq.answer}</p>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col md={6}>
            <Card className="help-card">
              <Card.Header as="h4">Getting Started</Card.Header>
              <Card.Body>
                <p>
                  If you are new to the repository, start by creating an account. 
                  Browse the available research to familiarize yourself with the content. 
                  Use the search and filter options to find research relevant to your interests.
                </p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="help-card">
              <Card.Header as="h4">Need More Help?</Card.Header>
              <Card.Body>
                <p>
                  If you cannot find the answer to your question in the FAQ section, 
                  please visit our <a href="/contact">Contact</a> page to reach out to our 
                  support team. We are here to help you make the most of the repository.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HelpFAQPage;

