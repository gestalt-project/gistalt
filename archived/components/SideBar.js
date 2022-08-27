import { Sidenav, Nav, Dropdown } from 'rsuite';

// not incorporated in main page yet
// workspace, outline, characters, world = undefined

export default function SideBar(props) {
    const proposalsSnapshot = props.proposalsSnapshot,
        router = props.router,
        gid = props.gid ? props.gid : null,
        { pid } = router.query;

    return (
        <div className='fixed z-10 top-[65px] h-full'>
            <div className='h-full w-[200px]'>
                <Sidenav className='h-full' appearance='inverse' defaultOpenKeys={['3', '4']} activeKey={pid}>
                    <Sidenav.Body >
                        <Nav >
                            <Nav.Item eventKey="1" onClick={() => router.push(`/gists/${gid}`)}>
                                Dashboard
                            </Nav.Item>
                            <Nav.Item eventKey="2" >
                                Workspace
                            </Nav.Item>

                            <Dropdown eventKey="3" title="Proposals" >
                                {proposalsSnapshot?.docs.map((doc) => (
                                    <Dropdown.Item eventKey={doc.id}
                                        onClick={() => router.push(`/proposals/${doc.id}`)}
                                    >{doc.data().proposalName}</Dropdown.Item>
                                ))}
                            </Dropdown>

                            <Dropdown eventKey="4" title="Outline" >
                                <Dropdown.Item eventKey="3-1">Part I</Dropdown.Item>
                                <Dropdown.Item eventKey="3-2">Part II</Dropdown.Item>
                                <Dropdown.Item eventKey="3-3">Part III</Dropdown.Item>
                                <Dropdown.Item eventKey="3-4">Part IV</Dropdown.Item>
                                <Dropdown.Item eventKey="3-4">Part V</Dropdown.Item>
                            </Dropdown>
                            <Dropdown eventKey="5" title="Characters" >
                                <Dropdown.Item eventKey="3-1">Ember</Dropdown.Item>
                                <Dropdown.Item eventKey="3-2">Evelyn</Dropdown.Item>
                                <Dropdown.Item eventKey="3-3">Ernald</Dropdown.Item>
                                <Dropdown.Item eventKey="3-4">Etka</Dropdown.Item>
                            </Dropdown>
                            <Dropdown eventKey="6" title="World" >
                                <Dropdown.Item eventKey="4-1">Cyberspsace</Dropdown.Item>
                                <Dropdown.Item eventKey="4-2">Virtual Reality</Dropdown.Item>
                                <Dropdown.Item eventKey="4-3">Mindspace</Dropdown.Item>
                            </Dropdown>
                        </Nav>
                    </Sidenav.Body>
                </Sidenav>
            </div>
        </div>
    )
}