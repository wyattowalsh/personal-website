// import { faDiagramProject, faNoteSticky } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { Anchor, Box, Button, Divider, Flex } from '@mantine/core';
// import { AboutModal } from './AboutModal';
// import styles from './Buttons.module.scss';

// export function Buttons() {

//     return (
//         <Box className={styles.buttonContainer}>
//             <Flex
//                 direction="row"
//                 align="center"
//                 justify="center"
//                 className={styles.flex}
//                 gap={{ base: 'sm', sm: 'lg', md: 'xl' }}
//             >
//                 <AboutModal />
//                 <Anchor href='/projects' className={styles.anchor}><Button rightSection={<FontAwesomeIcon icon={faDiagramProject} className={styles.icon}/>} className={styles.button} radius="15%" autoContrast fullWidth size="xl">Projects</Button></Anchor>
//                 <Anchor href='/notes' className={styles.anchor}><Button rightSection={<FontAwesomeIcon icon={faNoteSticky} className={styles.icon}/>} className={styles.button} radius="15%" autoContrast fullWidth size="xl">Notes</Button></Anchor>
//             </Flex>
//             <Divider className={styles.divider} />
//         </Box>
//     )
// }