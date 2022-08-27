import dynamic from 'next/dynamic';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";
import { useState, useEffect } from 'react';
import { EditorState, ContentState, RichUtils } from 'draft-js';
import { useRouter } from 'next/dist/client/router';
import { convertFromRaw, convertFromHTML, convertToRaw, Modifier, getContentStateFragment } from 'draft-js';
import { useSession } from 'next-auth/client';
import Button from '@material-tailwind/react/Button';
import Icon from '@material-tailwind/react/Icon';
import Modal from '@material-tailwind/react/Modal';
import ModalBody from '@material-tailwind/react/ModalBody';
import ModalFooter from '@material-tailwind/react/ModalFooter';
import { db } from '../firebase';
import { serverTimestamp } from "firebase/firestore";
import { useDocumentOnce } from "react-firebase-hooks/firestore"
// import axios from 'axios';
import { TextField, Grid } from "@material-ui/core";
import OpenAIAPI from "react-openai-api";
// import { OpenAI } from 'gpt-x';
import getFragmentFromSelection from 'draft-js/lib/getFragmentFromSelection';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';

import Select from 'react-select'


const Editor = dynamic(() => import("react-draft-wysiwyg").then((module) => module.Editor), {
    ssr: false,
}
);

function TextEditor({ show, gid, proposalName, inProposalSnapshot }) {

    const [session] = useSession();
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    // const [playgroundState, setPlaygroundState] = useState(EditorState.createEmpty());
    const [playgroundState, setPlaygroundState] = useState(EditorState.createEmpty());
    const [playgroundDisplayState, setPlaygroundDisplayState] = useState(false);
    const [playgroundShow, setPlaygroundShow] = useState(true);
    const [showTuneModal, setShowTuneModal] = useState(false);
    const [showPresetModal, setShowPresetModal] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [newProposalName, setNewProposalName] = useState("");

    const router = useRouter();
    const { pid } = router.query;

    const [snapshot] = useDocumentOnce(db.collection('userData').doc(session.user.email).collection('proposals').doc(pid));

    useEffect(() => {
        if (snapshot?.data()?.editorState) {
            setEditorState(EditorState.createWithContent(convertFromRaw(snapshot?.data()?.editorState)))
        }
        if (snapshot?.data()?.playgroundState) {
            setPlaygroundState(EditorState.createWithContent(convertFromRaw(snapshot?.data()?.playgroundState)))
        }
    }, [snapshot])

    const onEditorStateChange = (editorState) => {
        setEditorState(editorState);

        db.collection('userData').doc(session.user.email).collection('proposals').doc(pid).set({
            editorState: convertToRaw(editorState.getCurrentContent())
        }, {
            merge: true
        })

        // focusSelection()
    };

    const onPlaygroundStateChange = (playgroundState) => {
        setPlaygroundState(playgroundState);

        db.collection('userData').doc(session.user.email).collection('proposals').doc(pid).set({
            playgroundState: convertToRaw(playgroundState.getCurrentContent())
        }, {
            merge: true
        })

        const currentPlaygroundContent = playgroundState.getCurrentContent()

        setPromptText(currentPlaygroundContent.getPlainText())
        console.log('playgroundstatechanged', promptText)
    };

    const currentContent = editorState.getCurrentContent()
    const currentSelection = editorState.getSelection();

    const onAppendToEditor = () => {
        // simple version
        // const newBlock = playgroundState.getCurrentContent().getBlockMap()
        // const newState = Modifier.replaceWithFragment(currentContent, currentSelection, newBlock);
        // setEditorState(EditorState.push(editorState, newState, 'insert-fragment'))


        const selected = getFragmentFromSelection(playgroundState)
        if (selected == null) {
            const newBlock = playgroundState.getCurrentContent().getBlockMap()
            const newState = Modifier.replaceWithFragment(currentContent, currentSelection, newBlock);
            setEditorState(EditorState.push(editorState, newState, 'insert-fragment'))
            return
        }
        else {
            const selectedText = selected.map((block) => block.getText()).join('\n')
            const selectedContent = ContentState.createFromText(selectedText)
            const newBlock = selectedContent.getBlockMap()
            const newState = Modifier.replaceWithFragment(currentContent, currentSelection, newBlock);
            setEditorState(EditorState.push(editorState, newState, 'insert-fragment'))

            // attempting to shift focus - not working
            // EditorState.moveFocusToEnd(editorState)
            // editorState = EditorState.moveSelectionToEnd(editorState);
            // EditorState.forceSelection(editorState, editorState.getSelection());
        }

    };

    const onPullToPlayground = () => {

        const selected = getFragmentFromSelection(editorState)
        if (selected == null) {
            setPlaygroundState(editorState)
            return
        }
        else {
            const selectedText = selected.map((block) => block.getText()).join('\n')
            const selectedContent = ContentState.createFromText(selectedText)
            setPlaygroundState(EditorState.createWithContent(selectedContent))

            // attempting to shift focus - not working
            EditorState.moveFocusToEnd(playgroundState)
            playgroundState = EditorState.moveSelectionToEnd(playgroundState);
            EditorState.forceSelection(playgroundState, playgroundState.getSelection());
        }
    };

    const onGenerate = () => {
        // submitHandler()
        if (apiKey == '') {
            alert('Please enter your API key')
            return
        };

        console.log('ongenerate new');

        (async () => {
            const gptResponse = await openai.complete({
                engine: parameters.model,
                prompt: promptText,
                maxTokens: parameters.maxTokens,
                temperature: parameters.temperature,
                topP: 1,
                presencePenalty: 0,
                frequencyPenalty: 0,
                bestOf: 1,
                n: parameters.n,
                stream: false,
                stop: ['\n', "###"]
            });

            console.log("RESPONSE", gptResponse.data);
            responseHandler(gptResponse.data);
            // setPromptText(`${promptText + gptResponse.data.choices[0].text}`);
        })();

    };

    const onTune = () => {
        console.log('ontune')
        setShowTuneModal(!showTuneModal)
    };
    const onPreset = () => {
        console.log('ontune')
        setShowPresetModal(!showPresetModal)
    };

    const branchProposal = () => {
        db.collection('userData').doc(
            session.user.email).collection('proposals')
            .add({
                proposalName: newProposalName,
                gist: gid,
                timestamp: serverTimestamp(),
                editorState: convertToRaw(playgroundState.getCurrentContent()),
                playgroundState: convertToRaw(EditorState.createEmpty().getCurrentContent())
            }).then(function (docRef) {
                console.log("Proposal written with ID: ", docRef.id);
                router.push(`/proposals/${docRef.id}`)
            })
        setShowModal(false)
    };

    const modal = (
        <Modal size='sm' active={showModal} toggler={() => setShowModal(false)}
        >
            <ModalBody>
                <input type='text' value={newProposalName} onChange={(e) => setNewProposalName(e.target.value)} placeholder={proposalName} className='bg-gray-50 rounded-lg p-2 max-w-[160px] text-base outline-none'
                    onKeyDown={(e) =>
                        e.key == "Enter" && branchProposal()
                    } />
            </ModalBody>
            <ModalFooter>
                <Button
                    color='blue'
                    buttonType='link'
                    onClick={() => setShowModal(false)}
                    ripple='dark'
                >Cancel</Button>
                <Button color='blue' onClick={branchProposal} ripple='light'>
                    Branch</Button>
            </ModalFooter>
        </Modal>
    );

    const [apiKey, setApiKey] = useState("");
    const [promptText, setPromptText] = useState("");

    const OpenAI = require('openai-api');
    // const { OpenAI } = require('gpt-x');
    const openai = new OpenAI(apiKey);


    const [parameters, setParameters] = useState({
        prompt: "",
        model: "davinci",
        maxTokens: 10,
        temperature: 0.7,
        n: 1,
    });

    // const Input = styled(MuiInput)`
    // width: 42px;
    // `;

    const handleBlur = () => {
        if (parameters.temperature < 0) {
            setParameters(0);
        } else if (parameters.temperature > 1) {
            setValue(1);
        }
        if (parameters.n < 1) {
            setValue(1);
        } else if (parameters.n > 10) {
            setValue(10);
        }
        if (parameters.maxTokens < 1) {
            setValue(1);
        } else if (parameters.maxTokens > 500) {
            setValue(500);
        }
    };

    const sliderParameterList = [
        {
            field: parameters.temperature, name: 'Tempearture',
            setSliderFunction: (event, newValue) => { setParameters({ ...parameters, temperature: newValue }) },
            setInputFunction: (event) => { setParameters({ ...parameters, temperature: event.target.value === '' ? '' : Number(event.target.value) }) },
            handleBlur: () => { if (parameters.temperature < 0) { setParameters({ ...parameters, temperature: 0 }) } else if (parameters.temperature > 1) { setParameters({ ...parameters, temperature: 1 }) } },
            max: 1, min: 0, step: 0.1
        },

        {
            field: parameters.maxTokens, name: 'Max Tokens',
            setSliderFunction: (event, newValue) => { setParameters({ ...parameters, maxTokens: newValue }) },
            setInputFunction: (event) => { setParameters({ ...parameters, maxTokens: event.target.value === '' ? '' : Number(event.target.value) }) },
            handleBlur: () => { if (parameters.maxTokens < 1) { setParameters({ ...parameters, maxTokens: 1 }) } else if (parameters.maxTokens > 500) { setParameters({ ...parameters, maxTokens: 500 }) } },
            max: 500, min: 1, step: 1
        },

        {
            field: parameters.n, name: 'Number of Outputs',
            setSliderFunction: (event, newValue) => { setParameters({ ...parameters, n: newValue }) },
            setInputFunction: (event) => { setParameters({ ...parameters, n: event.target.value === '' ? '' : Number(event.target.value) }) },
            handleBlur: () => { if (parameters.n < 1) { setParameters({ ...parameters, n: 1 }) } else if (parameters.n > 10) { setParameters({ ...parameters, n: 10 }) } },
            max: 10, min: 1, step: 1
        },
    ];

    const [modelsList, setModelsList] = useState([]);
    const [presetsList, setPresetsList] = useState([{value: 'example preset', label: 'example preset'}, {value: 'example preset 2', label: 'example preset 2'}]);
    const [preset, setPreset] = useState();

    const fetchModels = () => {
        // submitHandler()
        if (apiKey == '') {
            alert('Please enter your API key')
            return
        };

        console.log('fetching models');

        (async () => {
            const modelsData = await openai.engines();
            // const fineTunesData = await openai.fineTunes();
            var models = [];
            var fineTunes = [];
            modelsData.data.data.forEach(function (model) {
                models.push({ value: model.id, label: model.id });
            });
            // fineTunesData.data.data.forEach(function (fineTune) {
            //     fineTunes.push({ value: model.id, label: model.id });
            // });
            var allModels = [...models, ...fineTunes];
            setModelsList(allModels);
            // setModelsList(modelsData.data.data.map((model) => (const options = [{ value: model.id, label: model.name }]) );
            console.log("FINETUNES", fineTunes, "MODELS", allModels);
            // setPromptText(`${promptText + gptResponse.data.choices[0].text}`);
        })();

    };

    const handleModelChange = (options) => {
        setParameters({ ...parameters, model: options.value });
    };

    const handlePresetChange = (options) => {
        setPreset(options.value );
    };

    const newPreset = () => {
        console.log('new preset');
    };


    const presetModal = (
        <Modal size='sm' active={showPresetModal} toggler={() => setShowPresetModal(!showPresetModal)}
        >
            <Box sx={{ width: 250 }}>
                <div className='text-black pb-4'>

                    <p className='text-sm pb-2'>Preset Prompt</p>
                    <div className='grid grid-cols-5'>
                        <div className='col-span-4'>
                            <Select options={presetsList} onChange={handlePresetChange} style={{ color: "black", fontSize: 14 }} />
                        </div>
                        <div className='col-span-1'>
                            <Button
                                color='blue'
                                buttonType='link'
                                onClick={() => newPreset()}
                                ripple='dark'
                            >New</Button>
                        </div>
                    </div>
                </div>
            </Box>
            <ModalFooter>
                <Button
                    color='blue'
                    buttonType='link'
                    onClick={() => setShowPresetModal(!showPresetModal)}
                    ripple='dark'
                >Cancel</Button>
                <Button color='blue' onClick={() => { setShowPresetModal(!showPresetModal), console.log("PRESET", preset) }} ripple='light'>
                    Select Preset</Button>
            </ModalFooter>
        </Modal>
    )

    const tuneModal = (
        <Modal size='sm' active={showTuneModal} toggler={() => setShowTuneModal(!showTuneModal)}
        >
            <Box sx={{ width: 250 }}>
                <div className='text-black pb-4'>

                    <p className='text-sm pb-2'>Model</p>
                    <div className='grid grid-cols-5'>
                        <div className='col-span-4'>
                            <Select options={modelsList} onChange={handleModelChange} style={{ color: "black", fontSize: 14 }} />
                        </div>
                        <div className='col-span-1'>
                            <Button
                                color='blue'
                                buttonType='link'
                                onClick={() => fetchModels()}
                                ripple='dark'
                            >Fetch</Button>
                        </div>
                    </div>
                </div>
            </Box>

            {sliderParameterList.map((param) => (
                <Box sx={{ width: 250 }}>
                    <div className='text-black'>
                        <Typography id="input-slider" gutterBottom className='text-sm'>
                            {param.name}
                        </Typography>
                    </div>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                        </Grid>
                        <Grid item xs>
                            <Slider
                                value={typeof value === 'number' ? value : param.field}
                                onChange={param.setSliderFunction}
                                aria-labelledby="input-slider"
                                max={param.max} min={param.min} step={param.step}
                            />
                        </Grid>
                        <Grid item>
                            <MuiInput
                                value={param.field}
                                size="small"
                                onChange={param.setInputFunction}
                                onBlur={param.handleBlur}
                                inputProps={{
                                    step: param.step,
                                    min: param.min,
                                    max: param.max,
                                    type: 'number',
                                    'aria-labelledby': 'input-slider',
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>

            ))}

            <ModalFooter>
                <Button
                    color='blue'
                    buttonType='link'
                    onClick={() => setShowTuneModal(!showTuneModal)}
                    ripple='dark'
                >Cancel</Button>
                <Button color='blue' onClick={() => { setShowTuneModal(!showTuneModal), console.log("PARAMETERS", parameters) }} ripple='light'>
                    Set Parameters</Button>
            </ModalFooter>
        </Modal>
    )


    // API Requests ///////////////////////////////////////////////////////////////////

    // (async () => {
    //     const gptResponse = await openai.complete({
    //         engine: 'davinci',
    //         prompt: 'this is a test',
    //         maxTokens: 5,
    //         temperature: 0.9,
    //         topP: 1,
    //         presencePenalty: 0,
    //         frequencyPenalty: 0,
    //         bestOf: 1,
    //         n: 1,
    //         stream: false,
    //         stop: ['\n', "testing"]
    //     });

    //     console.log(gptResponse.data);
    // })();


    const changeApiKeyHandler = (e) => {
        setApiKey(e.target.value);
    };

    const changePromptHandler = (e) => {
        setPromptText(e.target.value);
    };

    const styleMap = {
        'HIGHLIGHT': {
            'backgroundColor': '#faed27',
        },
        'BOLD': {
            'backgroundColor': '',
        },
        red: {
            color: 'rgba(255, 0, 0, 1.0)',
        }
    };
    // const newfunction = (colorContentState) => {
    //     setPlaygroundState(RichUtils.toggleInlineStyle(playgroundState, 'BOLD'));
    //     setPlaygroundState(EditorState.forceSelection(playgroundState, colorContentState.getSelectionAfter()));
    // }



    const responseHandler = (openAIResponse) => {
        setPromptText(`${promptText + openAIResponse.choices[0].text}`);
        // console.log(promptText);

        const currentPlaygroundContent = playgroundState.getCurrentContent()
        const currentPlaygroundSelection = playgroundState.getSelection()

        // const html = `<p>_<mark>${openAIResponse.choices[0].text}</mark>_</p>`
        // const colorBlocks = convertFromHTML(html);
        // const colorContentState = ContentState.createFromBlockArray(colorBlocks).blockMap

        const responseContentState = ContentState.createFromText(openAIResponse.choices[0].text).blockMap

        const newPlaygroundState = Modifier.replaceWithFragment(currentPlaygroundContent, currentPlaygroundSelection, responseContentState);
        setPlaygroundState(EditorState.push(playgroundState, newPlaygroundState, 'insert-fragment'))

        console.log('done generating')
    };

    ////////////////////////////////////////////////////////////////////////////////


    return (
        <div className='bg-[#F8F9FA] pb-[250px]'>

            {modal}
            <div className='bg-[#F8F9FA] pt-12'>
                <Editor
                    editorState={editorState}
                    onEditorStateChange={onEditorStateChange}
                    // Remove toolbar options for better UI
                    toolbar={{ options: ["inline", "fontSize", "fontFamily", "list", "textAlign", "colorPicker", "embedded", "image"] }}
                    toolbarClassName={show ? 'flex -mt-8 z-50 !justify-center mx-auto' : 'hide-toolbar'}
                    editorClassName='z-0 mt-5 min-h-[500px]    shadow-lg flex mx-10 mb-[50px] border text-black p-10'
                />
            </div>
            <div className="z-10 container fixed min-w-full bottom-0 bg-blue text-white">
                <div className='flex justify-between items-center p-3 pb-1'>
                    <h1 className='px-10 text-center text-xl'>PLAYGROUND</h1>
                    <div className='items-right pb-2'>
                        <input type='text' placeholder='OpenAI key' value={apiKey} onChange={(e) => changeApiKeyHandler(e)} className={!playgroundDisplayState || !playgroundShow ? 'hidden' : 'hidden md:!inline-flex h-10 bg-gray-50 text-light-gray rounded-lg p-2 text-sm outline-none'} />
                        {/* <Button
                            color='white'
                            size='regular'
                            className='hidden sm:!inline-flex h-10 align-middle'
                            rounded={false}
                            block={false}
                            iconOnly={true}
                            ripple='light'
                        >
                            <Icon name={playgroundShow ? 'close' : 'keyboard_arrow_up'} size='md' onClick={() => setPlaygroundShow(!playgroundShow)} />
                        </Button> */}

                        <Button
                            color='blue'
                            buttonType='filled'
                            size='regular'
                            className='hidden sm:!inline-flex h-10 align-middle'
                            rounded={false}
                            block={false}
                            iconOnly={false}
                            ripple='light'
                            onClick={onPullToPlayground}
                        >
                            <Icon name='arrow_downward' size='md' /> <div className='hidden lg:!inline-flex'>PULL</div>
                        </Button>

                        <Button
                            color='blue'
                            buttonType='filled'
                            size='regular'
                            className='hidden sm:!inline-flex h-10 align-middle'
                            rounded={false}
                            block={false}
                            iconOnly={false}
                            ripple='light'
                            onClick={onAppendToEditor}
                        >
                            <Icon name='merge_type' size='md' /> <div className='hidden lg:!inline-flex'>COMMIT</div>
                        </Button>
                        <Button
                            color='blue'
                            buttonType='filled'
                            size='regular'
                            className='hidden sm:!inline-flex h-10 align-middle'
                            rounded={false}
                            block={false}
                            iconOnly={false}
                            ripple='light'
                            onClick={() => setShowModal(true)}
                        >
                            <Icon name='call_split' size='md' /> <div className='hidden lg:!inline-flex'>BRANCH</div>
                        </Button>
                        <Button
                            color='blue'
                            buttonType='filled'
                            size='regular'
                            className='hidden sm:!inline-flex h-10 align-middle'
                            rounded={false}
                            block={false}
                            iconOnly={false}
                            ripple='light'
                            onClick={onTune}
                        >
                            <Icon name='tune' size='md' /> <div className='hidden lg:!inline-flex'>TUNE</div>
                        </Button>
                        <Button
                            color='blue'
                            buttonType='filled'
                            size='regular'
                            className='hidden sm:!inline-flex h-10 align-middle'
                            rounded={false}
                            block={false}
                            iconOnly={false}
                            ripple='light'
                            onClick={onPreset}
                        >
                            <Icon name='star' size='md' /> <div className='hidden lg:!inline-flex'>PRESET</div>
                        </Button>
                        <Button
                            color='blue'
                            buttonType='filled'
                            size='regular'
                            className='hidden sm:!inline-flex h-10 align-middle'
                            rounded={false}
                            block={false}
                            iconOnly={false}
                            ripple='light'
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={onGenerate}
                        >
                            <Icon name='play_arrow' size='md' /> <div className='hidden lg:!inline-flex'>GENERATE</div>
                            {/* <Icon name='send' size='md' /> GENERATE
                    <Icon name='publish' size='md' /> GENERATE
                    <Icon name='create' size='md' /> GENERATE
                    <Icon name='keyboard_tab' size='md' /> GENERATE
                    <Icon name='input' size='md' /> GENERATE */}
                        </Button>
                        <Button
                            color='white'
                            size='regular'
                            className={playgroundDisplayState ? 'hidden sm:inline-flex h-10 rotate-180 align-middle' : 'hidden sm:!inline-flex h-10 align-middle'}
                            rounded={false}
                            block={false}
                            iconOnly={true}
                            ripple='light'
                        >
                            <Icon name='open_in_new' size='md' onClick={() => setPlaygroundDisplayState(!playgroundDisplayState)} />
                        </Button>
                        <Button
                            color='white'
                            size='regular'
                            className='hidden sm:!inline-flex h-10 align-middle'
                            rounded={false}
                            block={false}
                            iconOnly={true}
                            ripple='light'
                        >
                            <Icon name={playgroundShow ? 'close' : 'keyboard_arrow_up'} size='md' onClick={() => setPlaygroundShow(!playgroundShow)} />
                        </Button>

                        {tuneModal}
                        {presetModal}

                    </div>
                </div>
                <div className={playgroundShow ? 'w-full' : 'hidden'}>
                    <Editor
                        editorState={playgroundState}
                        customStyleMap={styleMap}
                        onEditorStateChange={onPlaygroundStateChange}
                        toolbarClassName='hide-toolbar'
                        editorClassName={playgroundDisplayState ? 'mt-0 max-h-[400px] min-h-[400px]    shadow-lg flex mx-10 mb-5 border text-black p-10' : 'mt-0 max-h-[150px] min-h-[150px]    shadow-lg flex mx-10 mb-5 border text-black p-10'}
                    />
                </div>
            </div>

        </div>
    )
}

export default TextEditor
