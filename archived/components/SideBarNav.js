import { Sidenav, Nav, Dropdown } from 'rsuite';

// not incorporated in main page yet
// workspace, outline, characters, world = undefined
function SideBarNav(props) {
    const router = props.router;
    // const proposalSnapshot = props.proposalSnapshot,
    //     router = props.router,
    //     gid = props.gid ? props.gid : null,
    //     { pid } = router.query;
    // const router = props.router,
    // { sid, gid, pid } = router.query,
    // // use id for active key
    // id = sid ? sid : gid ? gid : pid ? pid : null;

    return ( 
        <div className='fixed z-10 top-[65px] h-full'>
            <div className='h-full w-[200px]'>
                <Sidenav className='h-full' appearance='inverse' defaultOpenKeys={['3', '4']} activeKey='1'>
                    <Sidenav.Body >
                        <Nav >
                            <Nav.Item eventKey="1" onClick={() => router.push(`/`)}>
                                Dashboard
                            </Nav.Item>
                            <Nav.Item eventKey="2" >
                                Workspace
                            </Nav.Item>

                            <Dropdown eventKey="3" title="Proposals" >
                            </Dropdown>
                        </Nav>
                    </Sidenav.Body>
                </Sidenav>
            </div>
        </div>
    )
}

export { SideBarNav };