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
import getFragmentFromSelection from 'draft-js/lib/getFragmentFromSelection';
// import { useStateWithCallbackLazy } from 'use-state-with-callback';
// import Slider, { Range } from 'rc-slider';
// import InputSlider from './Slider.js'
// import 'rc-slider/assets/index.css';

// import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';


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
        submitHandler()
        console.log('ongenerate')
    };

    const onTune = () => {
        console.log('ontune')
        setShowTuneModal(!showTuneModal)
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

    // const [parametersState, setParametersState] = useState({ x: 0, y: 0 });
    // const Slider = require('rc-slider');
    // const createSliderWithTooltip = Slider.createSliderWithTooltip;
    // const Range = createSliderWithTooltip(Slider.Range);

    const marks = {
        0: { style: { color: 'blue' }, label: '0' },
        0.2: { style: { color: 'white' }, label: '0.2' },
        0.4: { style: { color: 'white' }, label: '0.4' },
        0.6: { style: { color: 'white' }, label: '0.6' },
        0.8: { style: { color: 'white' }, label: '0.8' },
        1: { style: { color: 'blue' }, label: '1' }
    };

    // const [payload, setPayload] = useState({
    //     prompt: "",
    //     maxTokens: 10,
    //     temperature: 0.7,
    //     n: 1,
    // });

    const [parameters, setParameters] = useState({
        prompt: "",
        maxTokens: 10,
        temperature: 0.7,
        n: 1,
    });

    const [payload, setPayload] = useState({
        prompt: "",
        maxTokens: 10,
        temperature: 0.7,
        n: 1,
    });

    // const [payload, setPayload] = useState()

    // const [temperature, setTemperature] = useState(0.7);
    // const [maxTokens, setMaxTokens] = useState(10);
    // const [numOutput, setNumOutput] = useState(1);

    // const sendTempDataToParent = (newTemp) => {
    //     console.log("NEW TEMP", newTemp);
    //     setTemperature(newTemp);
    // };
    // const sendMaxTokensDataToParent = (newMaxTokens) => {
    //     console.log("NEW MAX TOKENS", newMaxTokens);
    //     setMaxTokens(newMaxTokens);
    // };
    // const sendNDataToParent = (newN) => {
    //     console.log("NEW N", newN);
    //     setN(newN);
    // };


    const Input = styled(MuiInput)`
    width: 42px;
    `;

    // const handleTempSliderChange = (event, newValue) => {
    //     //   setValue(newValue);
    //     // setTemperature(newValue);
    //     setPayload({ ...payload, temperature: newValue })
    // };

    // const handleTempInputChange = (event) => {
    //     //   setValue(event.target.value === '' ? '' : Number(event.target.value));
    //     setPayload({ ...payload, temperature: event.target.value === '' ? '' : Number(event.target.value) })
    //     // setTemperature(event.target.value === '' ? '' : Number(event.target.value));
    // };

    const handleBlur = () => {
        if (parameters.temperature < 0) {
            setValue(0);
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

    // const parameterList = [payload.temperature, payload.maxTokens, payload.n];
    // const setTempFunction = (event, newValue) => {
    //     setPayload({ ...payload, temperature: newValue })
    // }
    // const setMaxTokensFunction = (event, newValue) => {
    //     setPayload({ ...payload, maxTokens: newValue })
    // }
    // const setNFunction = (event, newValue) => {
    //     setPayload({ ...payload, n: newValue })
    // }

    const parameterList = [
        {field: parameters.temperature, name: 'Tempearture',
            setSliderFunction: (event, newValue) => { setParameters({ ...parameters, temperature: newValue }) }, 
            setInputFunction: (event) => { setParameters({ ...parameters, temperature: event.target.value === '' ? '' : Number(event.target.value) })},
            max: 1, min: 0, step: 0.1},

        {field: parameters.maxTokens, name: 'Max Tokens',
            setSliderFunction: (event, newValue) => { setParameters({ ...parameters, maxTokens: newValue }) }, 
            setInputFunction: (event) => { setParameters({ ...parameters, maxTokens: event.target.value === '' ? '' : Number(event.target.value) })},
            max: 500, min: 1, step: 1},

        {field: parameters.n, name: 'Number of Outputs',
            setSliderFunction: (event, newValue) => { setParameters({ ...parameters, n: newValue }) }, 
            setInputFunction: (event) => { setParameters({ ...parameters, n: event.target.value === '' ? '' : Number(event.target.value) })},
            max: 10, min: 1, step: 1},
      ];

    const tuneModal = (
        <Modal size='sm' active={showTuneModal} toggler={() => setShowTuneModal(!showTuneModal)}
        >
            {/* <InputSlider handleInputChange={(event, newValue) => setN(newValue) } 
            handleSliderchange={(event, newValue) => setN(newValue) }
            name='Number of Outputs' max={10} min={1} step={1} defaultValue={1}/>

            <InputSlider handleInputChange={(event) => setMaxTokens(event.target.value) } 
            handleSliderchange={(event) => setMaxTokens(event.target.value) }
            name='Max Tokens' max={300} min={1} step={5} defaultValue={64}/> */}

            {/* <InputSlider sendDataToParent={sendTempDataToParent}
                name='Temeprature' max={1} min={0} step={0.1} defaultValue={0.7} /> */}

            {parameterList.map((param) => (
                <Box sx={{ width: 250 }}>
                <Typography id="input-slider" style={{ color: "black" }} gutterBottom>
                    {param.name}
                </Typography>
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
                        <Input
                            value={param.field}
                            size="small"
                            onChange={param.setInputFunction}
                            // onBlur={props.handleBlur}
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


            {/* <Box sx={{ width: 250 }}>
                <Typography id="input-slider" style={{ color: "black" }} gutterBottom>
                    Temperature
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                    </Grid>
                    <Grid item xs>
                        <Slider
                            value={typeof value === 'number' ? value : payload.temperature}
                            onChange={handleTempSliderChange}
                            aria-labelledby="input-slider"
                            max={1} min={0} step={0.1}
                        />
                    </Grid>
                    <Grid item>
                        <Input
                            value={payload.temperature}
                            size="small"
                            onChange={handleTempInputChange}
                            // onBlur={props.handleBlur}
                            inputProps={{
                                step: 0.1,
                                min: 0,
                                max: 1,
                                type: 'number',
                                'aria-labelledby': 'input-slider',
                            }}
                        />
                    </Grid>
                </Grid>
            </Box> */}

            {/* <ModalBody>
                <div className='items-center flex-row'>
                    <div className='px-10 py-5'>
                        <Slider step={0.05} min={0} max={1} />
                    </div>
                    <div className='px-10 py-5'>
                    <Slider step={0.05} min={0} max={1} />
                    </div>
                    <div className='px-10 py-5'>
                    <Slider step={0.05} min={0} max={1} marks={marks} />
                    </div>
                </div>
            </ModalBody> */}
            <ModalFooter>
                <Button
                    color='blue'
                    buttonType='link'
                    onClick={() => setShowTuneModal(!showTuneModal)}
                    ripple='dark'
                >Cancel</Button>
                <Button color='blue' onClick={() => { setShowTuneModal(!showTuneModal), console.log("PARAMETERS", parameters) }} ripple='light'>
                    {/* setPayload({ ...payload, temperature: temperature, maxTokens: maxTokens, n: numOutput }),  */}
                    Set Parameters</Button>
            </ModalFooter>
        </Modal>
    )

    // const tuneModal = (
    //     <div>
    //         <Slider step={0.1} dots min={0} max={1} marks={marks}/>
    //         <Slider step={0.1} dots min={0} max={1} marks={marks}/>
    //         <Slider step={0.1} dots min={0} max={1} marks={marks}/>
    //     </div>
    // );

    // const testModal = (
    // <Modal
    //     // default false
    //     isOpen={showTuneModal}
    //     // default 60%
    //     width={'40%'}
    //     // default from right
    //     directionFrom={'right'}
    //     // default Modal
    //     contentLabel={'Demo Modal'}
    //     // onRequestClose={setShowTuneModal(false)}
    //     // optional for accessibility
    //     setAppElement={'#root'}
    //     // default false allows you to skip setAppElement prop for react-modal
    //     ariaHideApp={true}
    //     // allow you to set the maximum width of the viewport
    //     // at which the modal will be expanded to full screen
    //     maxMediaWidth={1024}
    //     // allows you to decorate a className or overlayClassName
    //     className={'string'}
    //     overlayClassName={'string'}
    //   >
    //     Demo content for Modal
    //   </Modal>
    //   );



    // API Requests ///////////////////////////////////////////////////////////////////

    const [apiKey, setApiKey] = useState("");
    const [promptText, setPromptText] = useState("");

    // const [payload, setPayload] = useState({
    //     prompt: "",
    //     maxTokens: 25,
    //     temperature: 0.5,
    //     n: 1,
    // });

    const changeApiKeyHandler = (e) => {
        setApiKey(e.target.value);
    };

    const changePromptHandler = (e) => {
        setPromptText(e.target.value);
    };

    const submitHandler = () => {
        const pl = { ...parameters, prompt: promptText };
        setPayload(pl);
        console.log('setpayload', pl)
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
            {!!apiKey && !!payload.prompt && (
                <OpenAIAPI
                    apiKey={apiKey}
                    payload={payload}
                    responseHandler={responseHandler}
                />
            )}
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
                            <Icon name='arrow_downward' size='md' /> <div className='hidden md:!inline-flex'>PULL</div>
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
                            <Icon name='merge_type' size='md' /> <div className='hidden md:!inline-flex'>COMMIT</div>
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
                            <Icon name='call_split' size='md' /> <div className='hidden md:!inline-flex'>BRANCH</div>
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
                            <Icon name='tune' size='md' /> <div className='hidden md:!inline-flex'>TUNE</div>
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
                            <Icon name='play_arrow' size='md' /> <div className='hidden md:!inline-flex'>GENERATE</div>
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
