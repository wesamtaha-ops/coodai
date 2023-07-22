import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Navbar from '../../components/layout/Navbar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import LoginForm from '../login';

export default function Home({ clientName, adminUsername, adminPassword }) {
    const [client, setClient] = useState(clientName);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [botName, setBotName] = useState('');
    const [botDirectories, setBotDirectories] = useState([]);
    const [renameBotDirectory, setRenameBotDirectory] = useState('');
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false); // Track login status

    const availableCredits = 50;
    const totalCredits = 100;
    const availableStorage = 95.13;
    const totalStorage = 100;

    useEffect(() => {
        checkLoginStatus();
        fetchBotDirectories();
    }, []);

    const fetchBotDirectories = async () => {
        try {
            const response = await axios.get(`/api/files/${client}`);
            setBotDirectories(response.data.directories);
        } catch (error) {
            console.error('Failed to fetch bot directories:', error);
        }
    };

    const handleLogin = () => {
        setIsAdminLoggedIn(true);
        document.cookie = 'adminLoggedIn=true';
    };

    const checkLoginStatus = () => {
        // Add your logic to check if the admin is logged in
        // For simplicity, let's assume the login status is stored in a session cookie
        const adminLoggedIn = document.cookie.includes('adminLoggedIn=true');
        setIsAdminLoggedIn(adminLoggedIn);
    };


    const handleAddModalOpen = () => {
        setShowAddModal(true);
    };

    const handleAddModalClose = () => {
        setShowAddModal(false);
        setBotName('');
    };

    const handleRenameModalOpen = (botDirectory) => {
        setShowRenameModal(true);
        setRenameBotDirectory(botDirectory);
        setBotName(botDirectory);
    };

    const handleRenameModalClose = () => {
        setShowRenameModal(false);
        setRenameBotDirectory('');
        setBotName('');
    };

    const handleBotNameChange = (event) => {
        const name = event.target.value.replace(/\s/g, '').toLowerCase();
        setBotName(name);
    };

    const handleAddBot = async () => {
        try {
            await axios.post(`/api/files/${client}?directoryName=${botName}`);
            fetchBotDirectories();
            handleAddModalClose();
        } catch (error) {
            console.error('Failed to create bot directory:', error);
        }
    };

    const handleRenameBot = async () => {
        try {
            await axios.post(`/api/files/${client}?directoryName=${renameBotDirectory}&newDirectoryName=${botName}`);
            fetchBotDirectories();
            handleRenameModalClose();
        } catch (error) {
            console.error('Failed to rename bot directory:', error);
        }
    };

    const handleDeleteBot = async (directoryName) => {
        try {
            if (confirm('Are you sure you want to delete this bot?')) {
                await axios.delete(`/api/files/${client}?directoryName=${directoryName}`);
                fetchBotDirectories();
            }
        } catch (error) {
            console.error('Failed to delete bot directory:', error);
        }
    };

    return (
        isAdminLoggedIn ? (
            <div style={{ backgroundColor: '#f1f5f9' }}>
                <Navbar clientFolder={clientName} />
                <div className="container mt-5">
                    <div className="row" style={{ padding: 0 }}>
                        <div className="col-lg-12" style={{ padding: 0, paddingRight: 20 }}>
                            <div className="crd mb-3">
                                <h4>My Chatbots ({botDirectories.length})</h4>
                                <br /><br />
                                <div>
                                    <button className="btn btn-primary btn-block" style={{ backgroundColor: '#9c27b0', border: 0, padding: 10, fontWeight: 700 }} onClick={handleAddModalOpen}>
                                        Create New ChatBOT
                                    </button>
                                </div>
                            </div>

                            {botDirectories.map((botDirectory) => (
                                <div key={botDirectory} class=" flex flex-col justify-between w-40 border rounded relative overflow-hidden" >
                                    <Link href={`/upload-and-train/${clientName}/${botDirectory}`} >
                                        <img src="https://t3.ftcdn.net/jpg/03/64/76/98/360_F_364769865_mVmKwtc1286zxkuskmxUug2AeX7NYyHA.jpg" width="180" height="180" />
                                    </Link>
                                    <div className="px-1 flex justify-center items-center h-14">
                                        <Link key={botDirectory} href={`/upload-and-train/${clientName}/${botDirectory}`} >

                                            <h3 className="text-xs md:text-sm font-semibold text-center overflow-hidden m-auto">
                                                {botDirectory}
                                            </h3>
                                        </Link>
                                        <div>
                                            <button className="btn btn-danger btn-sm ml-2" style={{ marginBottom: 10, marginRight: 10 }} onClick={() => handleDeleteBot(botDirectory)}>
                                                Delete
                                            </button>
                                            <button className="btn btn-primary btn-sm ml-2" style={{ marginBottom: 10 }} onClick={() => handleRenameModalOpen(botDirectory)}>
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="col-12" style={{ padding: 0, display: 'none' }}>
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

                    <Modal show={showAddModal} onHide={handleAddModalClose}>
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
                            <Button variant="secondary" onClick={handleAddModalClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleAddBot} disabled={!botName}>
                                Create Bot
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showRenameModal} onHide={handleRenameModalClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Rename ChatBOT</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter new bot name"
                                value={botName}
                                onChange={handleBotNameChange}
                            />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleRenameModalClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleRenameBot} disabled={!botName}>
                                Rename Bot
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div >
        ) : (<LoginForm adminUsername={adminUsername} adminPassword={adminPassword} onLogin={handleLogin} />)
    );
}

export async function getServerSideProps(context) {
    const { client } = context.query;
    return {
        props: {
            clientName: client || '',
            adminUsername: process.env.ADMIN_USERNAME,
            adminPassword: process.env.ADMIN_PASSWORD,
        },
    };
}
