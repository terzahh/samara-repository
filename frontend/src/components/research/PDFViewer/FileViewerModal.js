import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { Document, Page, pdfjs } from 'react-pdf';
import * as mammoth from 'mammoth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faSearchPlus,
    faSearchMinus,
    faTimes,
    faDownload
} from '@fortawesome/free-solid-svg-icons';
import './FileViewerModal.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const FileViewerModal = ({ show, onHide, fileUrl, fileName, title, isRestricted }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [docxContent, setDocxContent] = useState('');
    const [fileType, setFileType] = useState(null);

    useEffect(() => {
        if (show && fileUrl) {
            setPageNumber(1);
            setScale(1.0);
            setLoading(true);
            setError(null);
            setDocxContent('');

            const lowerName = (fileName || fileUrl).toLowerCase();
            let type = 'unknown';

            if (lowerName.endsWith('.pdf')) type = 'pdf';
            else if (/\.(jpg|jpeg|png|gif|webp)$/.test(lowerName)) type = 'image';
            else if (/\.(docx|doc)$/.test(lowerName)) type = 'docx';
            else if (/\.(pptx|ppt)$/.test(lowerName)) type = 'pptx';
            else if (lowerName.endsWith('.txt')) type = 'txt';

            setFileType(type);

            if (type === 'docx') {
                fetch(fileUrl)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
                    .then(result => {
                        setDocxContent(result.value);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error('DOCX Load Error:', err);
                        setError('Failed to load Word document. Please download to view.');
                        setLoading(false);
                    });
            } else if (type === 'pdf' || type === 'image') {
                // PDF loading handled by Document component
                // Image loading handled by img onLoad
                // For PDF, we wait for onLoadSuccess
                if (type === 'image') setLoading(false);
            } else {
                setLoading(false); // Unknown or unsupported types
            }
        }
    }, [show, fileUrl, fileName]);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
    }

    function onDocumentLoadError(err) {
        console.error('PDF Load Error:', err);
        setError('Failed to load PDF document.');
        setLoading(false);
    }

    const changePage = (offset) => {
        setPageNumber(prevPage => Math.min(Math.max(1, prevPage + offset), numPages || 1));
    };

    const changeScale = (delta) => {
        setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 3.0));
    };

    const renderContent = () => {
        if (loading && fileType === 'pdf') {
            // specific loading for pdf is handled inside Document
        }

        switch (fileType) {
            case 'pdf':
                return (
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={<div style={{ height: '50px' }}></div>}
                        noData={<div className="p-4">No PDF file specified.</div>}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="pdf-page"
                        />
                    </Document>
                );
            case 'image':
                return (
                    <img
                        src={fileUrl}
                        alt={title}
                        style={{ maxWidth: '100%', transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
                    />
                );
            case 'docx':
                return (
                    <div
                        className="docx-content bg-white p-5 text-start shadow-sm"
                        style={{ maxWidth: '800px', margin: '0 auto', minHeight: '500px' }}
                        dangerouslySetInnerHTML={{ __html: docxContent }}
                    />
                );
            case 'pptx':
                return (
                    <div className="text-center p-5">
                        <div className="mb-4">
                            <FontAwesomeIcon icon={faDownload} size="3x" className="text-secondary" />
                        </div>
                        <h3>Preview not available for PowerPoint files</h3>
                        <p className="lead">Please download the file to view presentation slides.</p>
                        {/* Download button could go here IF we passed the logic, but we keep it simple since main page has download */}
                    </div>
                );
            default:
                return (
                    <div className="text-center p-5">
                        <h3>Preview not available for this file type</h3>
                        <p>Please download the file to view it.</p>
                    </div>
                );
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            fullscreen={true}
            className="file-viewer-modal"
            backdrop="static"
        >
            <Modal.Header>
                <div className="d-flex align-items-center justify-content-between w-100">
                    <Modal.Title className="h5 text-truncate" style={{ maxWidth: '70%' }}>
                        {title || 'Document Viewer'}
                        {isRestricted && <span className="ms-2 text-danger small">(Preview Mode)</span>}
                    </Modal.Title>

                    <div className="pdf-controls d-flex align-items-center">
                        {(fileType === 'pdf' || fileType === 'image') && (
                            <>
                                <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => changeScale(-0.1)} disabled={loading || !!error} title="Zoom Out">
                                    <FontAwesomeIcon icon={faSearchMinus} />
                                </Button>
                                <span className="me-2 text-muted small">{Math.round(scale * 100)}%</span>
                                <Button variant="outline-secondary" size="sm" className="me-3" onClick={() => changeScale(0.1)} disabled={loading || !!error} title="Zoom In">
                                    <FontAwesomeIcon icon={faSearchPlus} />
                                </Button>
                            </>
                        )}

                        {fileType === 'pdf' && (
                            <>
                                <Button variant="outline-primary" size="sm" className="me-1" onClick={() => changePage(-1)} disabled={pageNumber <= 1 || loading || !!error}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </Button>
                                <span className="mx-2">Page {pageNumber} of {numPages || '--'}</span>
                                <Button variant="outline-primary" size="sm" className="me-3" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1) || loading || !!error}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </Button>
                            </>
                        )}

                        <Button variant="danger" size="sm" onClick={onHide}>
                            <FontAwesomeIcon icon={faTimes} className="me-1" />
                            Close
                        </Button>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="pdf-viewer-body bg-light text-center p-0 position-relative">
                <div className="pdf-container d-inline-block shadow-sm my-3" onContextMenu={(e) => e.preventDefault()}>
                    {loading && (
                        <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 10 }}>
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Loading document...</p>
                        </div>
                    )}

                    {error && (
                        <Alert variant="danger" className="m-4">{error}</Alert>
                    )}

                    {fileUrl && !error && (
                        <div className={isRestricted ? "pdf-restricted-blur" : ""}>
                            {renderContent()}
                        </div>
                    )}

                    {isRestricted && !loading && !error && fileType !== 'pptx' && (
                        <div className="pdf-restricted-overlay">
                            <div className="pdf-restricted-message">
                                <h3>Login to read this</h3>
                                <p>This content is restricted to authorized users.</p>
                                <Button variant="primary" href="/login">Log In</Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default FileViewerModal;
