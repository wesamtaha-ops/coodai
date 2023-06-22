import React, { useState, useEffect } from 'react';
import styles from './SettingsForm.module.css';
import { SketchPicker } from 'react-color';

const SettingsForm = ({ clientFolder }) => {
    const [systemPrompt, setSystemPrompt] = useState('');
    const [chatPrompt, setChatPrompt] = useState('');
    const [chatTemperature, setChatTemperature] = useState(0);
    const [chatModel, setChatModel] = useState('gpt-3.5-turbo');
    const [mainBG, setMainBG] = useState('');
    const [mainFont, setMainFont] = useState('Arial');
    const [chatIcon, setChatIcon] = useState('');
    const [userIcon, setUserIcon] = useState('');
    const [userMessageBG, setUserMessageBG] = useState('');
    const [userMessageColor, setUserMessageColor] = useState('');
    const [systemMessageBG, setSystemMessageBG] = useState('');
    const [systemMessageColor, setSystemMessageColor] = useState('');
    const [promptBG, setPromptBG] = useState('');
    const [promptColor, setPromptColor] = useState('');
    const [submitBG, setSubmitBG] = useState('');
    const [userIconColor, setUserIconColor] = useState('');
    const [selectedColorKey, setSelectedColorKey] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`/api/settings?clientFolder=${encodeURIComponent(clientFolder)}`);

                if (response.ok) {
                    const settings = await response.json();
                    setSystemPrompt(settings.systemPrompt || '');
                    setChatPrompt(settings.chatPrompt || '');
                    setChatTemperature(settings.chatTemperature || 0);
                    setChatModel(settings.chatModel || 'gpt-3.5-turbo');
                    setMainBG(settings.mainBG || '');
                    setMainFont(settings.mainFont || 'Arial');
                    setChatIcon(settings.chatIcon || '');
                    setUserIcon(settings.userIcon || '');
                    setUserMessageBG(settings.userMessageBG || '');
                    setUserMessageColor(settings.userMessageColor || '');
                    setSystemMessageBG(settings.systemMessageBG || '');
                    setSystemMessageColor(settings.systemMessageColor || '');
                    setPromptBG(settings.promptBG || '');
                    setPromptColor(settings.promptColor || '');
                    setSubmitBG(settings.submitBG || '');
                    setUserIconColor(settings.userIconColor || '');
                } else {
                    console.error('Failed to fetch settings.');
                }
            } catch (error) {
                console.error('An error occurred:', error);
            }
        };

        fetchSettings();
    }, [clientFolder]);

    const handleColorChange = (color) => {
        switch (selectedColorKey) {
            case 'mainBG':
                setMainBG(color.hex);
                break;
            case 'userMessageBG':
                setUserMessageBG(color.hex);
                break;
            case 'userMessageColor':
                setUserMessageColor(color.hex);
                break;
            case 'systemMessageBG':
                setSystemMessageBG(color.hex);
                break;
            case 'systemMessageColor':
                setSystemMessageColor(color.hex);
                break;
            case 'promptBG':
                setPromptBG(color.hex);
                break;
            case 'promptColor':
                setPromptColor(color.hex);
                break;
            case 'submitBG':
                setSubmitBG(color.hex);
                break;
            case 'userIconColor':
                setUserIconColor(color.hex);
                break;
            default:
                break;
        }
    };

    const handleColorPickerClick = (key) => {
        setSelectedColorKey(key);
    };

    const handleColorPickerClose = () => {
        setSelectedColorKey('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = {
            systemPrompt,
            chatPrompt,
            chatTemperature,
            chatModel,
            mainBG,
            mainFont,
            chatIcon,
            userIcon,
            userMessageBG,
            userMessageColor,
            systemMessageBG,
            systemMessageColor,
            promptBG,
            promptColor,
            submitBG,
            userIconColor,
            // Include other form data fields here
        };

        try {
            const response = await fetch(`/api/settings?clientFolder=${encodeURIComponent(clientFolder)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Settings updated successfully!');
            } else {
                console.error('Failed to update settings.');
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };

    return (
        <form className={styles.settingsForm} onSubmit={handleSubmit}>
            <label>
                System <br /> Prompt:
                <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
            </label>
            <br />
            <label>
                Chat <br /> Prompt:
                <textarea value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)} />
            </label>
            <br />
            <label>
                Chat Temperature:
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={chatTemperature}
                    onChange={(e) => setChatTemperature(parseFloat(e.target.value))}
                />
                {chatTemperature === 0 ? 'Reasoning' : 'Creative'}
            </label>
            <br />
            <label>
                Chat Model:
                <select value={chatModel} onChange={(e) => setChatModel(e.target.value)}>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-3.5-turbo-0613">gpt-3.5-turbo-0613</option>
                    <option value="gpt4">gpt4</option>
                    <option value="gpt-4-0613">gpt-4-0613</option>
                </select>
            </label>
            <br />
            <label>
                Main
                <br />
                Background Color:
                <div
                    className={styles.colorPickerSwatch}
                    style={{ background: mainBG }}
                    onClick={() => handleColorPickerClick('mainBG')}
                />
                {selectedColorKey === 'mainBG' && (
                    <div className={styles.colorPickerPopover}>
                        <div className={styles.colorPickerCover} onClick={handleColorPickerClose} />
                        <SketchPicker color={mainBG} onChange={handleColorChange} />
                    </div>
                )}
            </label>
            <br />
            <label>
                Main  Font:
                <select value={mainFont} onChange={(e) => setMainFont(e.target.value)}>
                    <option value="Arial">Arial</option>
                    <option value="Almarai">Almarai</option>
                </select>
            </label>
            <br />
            <label>
                Chat Icon:
                <input type="text" value={chatIcon} onChange={(e) => setChatIcon(e.target.value)} />
            </label>
            <br />
            <label>
                User Icon:
                <input type="text" value={userIcon} onChange={(e) => setUserIcon(e.target.value)} />
            </label>
            <br />
            <label>
                User Message <br /> Background Color:
                <div
                    className={styles.colorPickerSwatch}
                    style={{ background: userMessageBG }}
                    onClick={() => handleColorPickerClick('userMessageBG')}
                />
                {selectedColorKey === 'userMessageBG' && (
                    <div className={styles.colorPickerPopover}>
                        <div className={styles.colorPickerCover} onClick={handleColorPickerClose} />
                        <SketchPicker color={userMessageBG} onChange={handleColorChange} />
                    </div>
                )}
            </label>
            <br />
            <label>
                User Message<br /> Text Color:
                <div
                    className={styles.colorPickerSwatch}
                    style={{ background: userMessageColor }}
                    onClick={() => handleColorPickerClick('userMessageColor')}
                />
                {selectedColorKey === 'userMessageColor' && (
                    <div className={styles.colorPickerPopover}>
                        <div className={styles.colorPickerCover} onClick={handleColorPickerClose} />
                        <SketchPicker color={userMessageColor} onChange={handleColorChange} />
                    </div>
                )}
            </label>
            <br />
            <label>
                System Message <br /> Background Color:
                <div
                    className={styles.colorPickerSwatch}
                    style={{ background: systemMessageBG }}
                    onClick={() => handleColorPickerClick('systemMessageBG')}
                />
                {selectedColorKey === 'systemMessageBG' && (
                    <div className={styles.colorPickerPopover}>
                        <div className={styles.colorPickerCover} onClick={handleColorPickerClose} />
                        <SketchPicker color={systemMessageBG} onChange={handleColorChange} />
                    </div>
                )}
            </label>
            <br />
            <label>
                System Message <br /> Text Color:
                <div
                    className={styles.colorPickerSwatch}
                    style={{ background: systemMessageColor }}
                    onClick={() => handleColorPickerClick('systemMessageColor')}
                />
                {selectedColorKey === 'systemMessageColor' && (
                    <div className={styles.colorPickerPopover}>
                        <div className={styles.colorPickerCover} onClick={handleColorPickerClose} />
                        <SketchPicker color={systemMessageColor} onChange={handleColorChange} />
                    </div>
                )}
            </label>
            <br />
            <label>
                Question Area <br /> Background Color:
                <div
                    className={styles.colorPickerSwatch}
                    style={{ background: promptBG }}
                    onClick={() => handleColorPickerClick('promptBG')}
                />
                {selectedColorKey === 'promptBG' && (
                    <div className={styles.colorPickerPopover}>
                        <div className={styles.colorPickerCover} onClick={handleColorPickerClose} />
                        <SketchPicker color={promptBG} onChange={handleColorChange} />
                    </div>
                )}
            </label>
            <br />
            <label>
                Question Color:
                <div
                    className={styles.colorPickerSwatch}
                    style={{ background: promptColor }}
                    onClick={() => handleColorPickerClick('promptColor')}
                />
                {selectedColorKey === 'promptColor' && (
                    <div className={styles.colorPickerPopover}>
                        <div className={styles.colorPickerCover} onClick={handleColorPickerClose} />
                        <SketchPicker color={promptColor} onChange={handleColorChange} />
                    </div>
                )}
            </label>
            <br />
            <label>
                Submit Button <br /> Background Color:
                <div
                    className={styles.colorPickerSwatch}
                    style={{ background: submitBG }}
                    onClick={() => handleColorPickerClick('submitBG')}
                />
                {selectedColorKey === 'submitBG' && (
                    <div className={styles.colorPickerPopover}>
                        <div className={styles.colorPickerCover} onClick={handleColorPickerClose} />
                        <SketchPicker color={submitBG} onChange={handleColorChange} />
                    </div>
                )}
            </label>
            <br />
            <label>
                User Icon Color:
                <div
                    className={styles.colorPickerSwatch}
                    style={{ background: userIconColor }}
                    onClick={() => handleColorPickerClick('userIconColor')}
                />
                {selectedColorKey === 'userIconColor' && (
                    <div className={styles.colorPickerPopover}>
                        <div className={styles.colorPickerCover} onClick={handleColorPickerClose} />
                        <SketchPicker color={userIconColor} onChange={handleColorChange} />
                    </div>
                )}
            </label>
            <br />
            <button type="submit">Submit</button>
        </form>
    );
};

export default SettingsForm;
