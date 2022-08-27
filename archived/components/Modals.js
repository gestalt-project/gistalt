import Modal from '@material-tailwind/react/Modal';
import ModalBody from '@material-tailwind/react/ModalBody';
import ModalFooter from '@material-tailwind/react/ModalFooter';
import React, { useState, useEffect } from 'react';
import Button from '@material-tailwind/react/Button';
import { BlueButton } from '../../components/Buttons';
import { createData, deleteData, updateData, branchData } from '../../components/handleData';
import { useDocumentOnce } from "react-firebase-hooks/firestore";

function CreateModal(props) {
  const [input, setInput] = useState(''),
    router = props.router,
    datatype = props.datatype,
    db = props.db,
    session = props.session,
    togglerFunc = props.togglerFunc,
    sid = props.sid ? props.sid : null,
    gid = props.gid ? props.gid : null;

  return (
    <Modal size='sm' active toggler={() => togglerFunc({ func: '' })}>
      <ModalBody>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type='text'
          className='outline-none w-full'
          placeholder={"Enter name of " + datatype}
          onKeyDown={(e) => {
            e.key == "Enter" && createData({ input: input, datatype: datatype, db: db, session: session, sid: sid, gid: gid });
            e.key == "Enter" && togglerFunc({ func: '' })
          }}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          color='blue'
          buttonType='link'
          onClick={() => togglerFunc({ func: '' })}
          ripple='dark'
        >Cancel</Button>
        <Button color='blue' onClick={() => {
          createData({ input: input, datatype: datatype, db: db, session: session, sid: sid, gid: gid });

          togglerFunc({ func: '' })
        }} ripple='light'>
          Create</Button>
      </ModalFooter>
    </Modal>
  )
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function DeleteModal(props) {
  const datatype = props.datatype,
    db = props.db,
    session = props.session,
    togglerFunc = props.togglerFunc,
    sid = props.sid ? props.sid : null,
    gid = props.gid ? props.gid : null,
    pid = props.pid ? props.pid : null,
    storyList = useDocumentOnce(db.collection('userData').doc(session.user.email).collection('stories')),
    gistList = useDocumentOnce(db.collection('userData').doc(session.user.email).collection('gists')),
    proposalList = useDocumentOnce(db.collection('userData').doc(session.user.email).collection('proposals'));

  return (
    <Modal size='sm' active={true} toggler={() => togglerFunc({ func: '' })}>
      <ModalBody>Deleting {datatype}</ModalBody>
      <ModalFooter>
        <Button
          color='blue'
          buttonType='link'
          onClick={() => togglerFunc({ func: '' })}
          ripple='dark'
        >Cancel</Button>
        <Button color='blue' onClick={() => {
          deleteData({ datatype: datatype, db: db, session: session, sid: sid, gid: gid, pid: pid, storyList: storyList, gistList: gistList, proposalList: proposalList });
          togglerFunc({ func: '' })
        }} ripple='light'>
          Delete</Button>
      </ModalFooter>
    </Modal>
  )
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UpdateModal(props) {
  const db = props.db,
    datatype = props.datatype,
    session = props.session,
    togglerFunc = props.togglerFunc,
    [newDataName, setNewDataName] = useState(''),
    dataName = props.storyName ? props.storyName : props.gistName ? props.gistName : props.proposalName ? props.proposalName : null,
    id = props.sid ? props.sid : props.gid ? props.gid : props.pid ? props.pid : null,
    [inDataSnapshot] = useDocumentOnce(db.collection('userData').doc(session.user.email).collection(datatype == 'story' ? 'stories' : String(datatype) + 's').doc(id));

  return (
    <Modal size='sm' active={true} toggler={() => togglerFunc({ func: '' })}
    >
      <ModalBody>
        <div className='items-center flex'>
          <input type='text' value={newDataName} onChange={(e) => setNewDataName(e.target.value)} placeholder={dataName}
            className='bg-mid-gray rounded-lg p-2 max-w-[160px] text-base outline-none'
            onKeyDown={(e) => {
              e.key == "Enter" && updateData({ datatype: datatype, db: db, session: session, newDataName: newDataName, id: id });
              e.key == "Enter" && togglerFunc({ func: '' })
            }} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='blue'
          buttonType='link'
          onClick={() => togglerFunc({ func: '' })}
          ripple='dark'
        >Cancel</Button>
        <Button color='blue' onClick={() => { updateData({ datatype: datatype, db: db, session: session, newDataName: newDataName, id: id }), togglerFunc({ func: '' }) }} ripple='light'>
          Rename</Button>

        <BlueButton icon='call_split' onClickFunc={() => { branchData({ datatype: datatype, db: db, session: session, dataName: dataName, newDataName: newDataName, inDataSnapshot: inDataSnapshot }), togglerFunc({ func: '' }) }} />
        <BlueButton icon='file_download' onClickFunc={() => { downloadData(), togglerFunc({ func: '' }) }} />
        <BlueButton icon='delete' onClickFunc={() => { deleteData({ datatype: datatype, db: db, session: session, id: id }), togglerFunc({ func: '' }) }} />
      </ModalFooter>
    </Modal>
  )
}

export { CreateModal, DeleteModal, UpdateModal }