import { useState, useRef, useEffect, useMemo } from 'react';
import Head from 'next/head';
import styles from '../../styles/Home.module.css';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import CircularProgress from '@mui/material/CircularProgress';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Link from 'next/link';


export default function Home({ clientName }) {
    const [client, setClient] = useState(clientName);

    const [showModal, setShowModal] = useState(false);
    const [botName, setBotName] = useState('');
    const availableCredits = 50;
    const totalCredits = 100;
    const availableStorage = 95.13;
    const totalStorage = 100;


    const handleModalOpen = () => {
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setBotName('');
    };

    const handleBotNameChange = (event) => {
        setBotName(event.target.value);
    };

    const handleBotNameSubmit = () => {
        // Perform actions with the bot name (e.g., create a new bot)
        handleModalClose();
    };

    return (
        <div style={{ backgroundColor: '#f1f5f9' }}>
            <Navbar clientFolder={clientName} />
            <div className="container mt-5" >
                <div className="row" style={{ padding: 0 }}>
                    <div className="col-lg-6" style={{ padding: 0, paddingRight: 20 }}>
                        <div className="crd mb-4">
                            <h4 >My Chatbots 3/3</h4>
                            <br /><br />
                            <div >
                                <button className="btn btn-primary btn-block" style={{ backgroundColor: '#9c27b0', border: 0, padding: 10, fontWeight: 700 }} onClick={handleModalOpen}>
                                    Create New ChatBOT
                                </button>
                            </div>
                        </div>

                        <Link href='/upload-and-train/smartcode/law' class=" flex flex-col justify-between w-40 border rounded relative overflow-hidden">
                            <img src="https://t3.ftcdn.net/jpg/03/64/76/98/360_F_364769865_mVmKwtc1286zxkuskmxUug2AeX7NYyHA.jpg" width="180" height="180" />
                            <div class=" px-1 flex justify-center items-center h-14">
                                <h3 class="text-xs md:text-sm font-semibold text-center overflow-hidden m-auto">
                                    Sahmsi
                                </h3>
                            </div>
                        </Link>

                        <Link href='/upload-and-train/smartcode/votly' class=" flex flex-col justify-between w-40 border rounded relative overflow-hidden">
                            <img src="https://t3.ftcdn.net/jpg/03/64/76/98/360_F_364769865_mVmKwtc1286zxkuskmxUug2AeX7NYyHA.jpg" width="180" height="180" />
                            <div class=" px-1 flex justify-center items-center h-14">
                                <h3 class="text-xs md:text-sm font-semibold text-center overflow-hidden m-auto">
                                    VOTLY
                                </h3>
                            </div>
                        </Link>

                        <Link href='/upload-and-train/smartcode/wevo' class=" flex flex-col justify-between w-40 border rounded relative overflow-hidden">
                            <img src="https://t3.ftcdn.net/jpg/03/64/76/98/360_F_364769865_mVmKwtc1286zxkuskmxUug2AeX7NYyHA.jpg" width="180" height="180" />
                            <div class=" px-1 flex justify-center items-center h-14">
                                <h3 class="text-xs md:text-sm font-semibold text-center overflow-hidden m-auto">
                                    WEVO
                                </h3>
                            </div>
                        </Link>

                    </div>
                    <div className="col-lg-6" style={{ padding: 0 }}>
                        <div className="card">

                            <div className="card-header">Current Plan Details</div>
                            <div className="card-body">
                                <div className="card-text">
                                    <h2 > Free</h2>
                                    <ul style={{ marginTop: 10 }}>
                                        <li> 100 message credits/month</li>
                                        <li> 5 MB storage space</li>
                                        <li> 15000 words/chatbot</li>
                                        <li> 2 chatbots</li>
                                        <li> 5 documents</li>
                                        <li> Unlimited website embedding</li>
                                        <li> Powered by CoodAI Branded</li>
                                    </ul>
                                    <div className="card-body">
                                        <button className="btn btn-primary" style={{ backgroundColor: '#111827', padding: 10, border: 0 }}>Manage Your Subscription</button>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <br />
                        <div>
                            <div className="card progressCard">
                                <div className="card-header">Your plan usage</div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <p className="card-text">Available credits</p>
                                        <ProgressBar now={(availableCredits / totalCredits) * 100} label={`${availableCredits} / ${totalCredits}`} />
                                    </div>
                                    <div>
                                        <p className="card-text">Available storage</p>
                                        <ProgressBar now={(availableStorage / totalStorage) * 100} label={`${availableStorage} MB / ${totalStorage} MB`} />
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div className="card">
                                <div className="card-header">Addons</div>
                                <div className="card-body">
                                    <button style={{ marginBottom: 10, marginRight: 10, padding: 8, backgroundColor: '#009688', border: 0 }} className="btn btn-success">  1000 message / month for $9.99 </button>

                                    <button style={{ marginBottom: 10, marginRight: 10, padding: 8, backgroundColor: '#009688', border: 0 }} className="btn btn-success">  5000 message / month for $39.99 </button>

                                    <button style={{ marginBottom: 10, marginRight: 10, padding: 8, backgroundColor: '#009688', border: 0 }} className="btn btn-success">  10000 message / month for $89.99 </button>

                                    <button style={{ marginBottom: 10, marginRight: 10, padding: 8, backgroundColor: '#009688', border: 0 }} className="btn btn-success">  50000 message / month for $249.99 </button>

                                </div>
                            </div>
                            <br /><br /><br /><br />
                        </div>
                    </div>

                </div>
                <Modal show={showModal} onHide={handleModalClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create New ChatBOT</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter bot name"
                            value={botName}
                            onChange={handleBotNameChange}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleBotNameSubmit}>
                            Create Bot
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div >
        </div >
    );
}

export async function getServerSideProps(context) {
    const { client } = context.query;
    const { bot } = context.query;
    return {
        props: {
            clientName: client || '',
        },
    };
}
