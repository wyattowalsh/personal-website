import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Anchor, Button, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import styles from './AboutModal.module.scss';


const AboutText = () => {
    return (
        <Text align="center">
            <Text align="center" size="xl" fw={800}>
                Hello there! <Text className={styles.wave}>👋</Text>
            </Text>
            <br />
            <Text align="center">
                Thanks for stopping by my personal website! 
                <br/><br/>
                I'm Wyatt Walsh. I grew up in the <Anchor href="https://maps.app.goo.gl/3W5KNmfnuAvPoABB6" target="_blank" underline="hover">Eastern Sierras</Anchor> of California, where I developed a love for fishing 🎣, backpacking 🎒, and mountain biking 🚵‍♂️.
            </Text>
            <br/>
            <Text align="center">
                At 16, I was fortunate enough to attend <Anchor href="https://www.hotchkiss.org/" target="_blank" underline="hover">the Hotchkiss School</Anchor> in <Anchor href="https://maps.app.goo.gl/dXiMaWJACAro9DU57" target='_blank' underline='hover'>Lakeville, Connecticut</Anchor>. I then moved on to <Anchor href="https://www.berkeley.edu/" target="_blank" underline="hover">the University of California, Berkeley</Anchor>, where I began as a <Anchor href="https://guide.berkeley.edu/undergraduate/degree-programs/bioengineering-materials-science-engineering-joint-major/" target='_blank' underline='hover'>Materials Science and Bioengineering Joint Major</Anchor>. However, my interests evolved, leading me to graduate with a degree in <Anchor href="https://ieor.berkeley.edu/undergraduate-resources/bachelor-of-science-b-s-industrial-engineering-operations-research/?" target="_blank" underline="hover">Industrial Engineering and Operations Research</Anchor>.
            </Text>
            <br/>
            <Text align="center">
                After college, I explored entrepreneurship within the Web3 space. I then joined a seed-stage start-up as a Frontend Software Engineer, and eventually moved to <Anchor href="https://www.jpmorganchase.com/" target="_blank" underline="hover">JPMorgan Chase & Co</Anchor> as a Senior Associate Software Engineer focused on backend data engineering for the Credit Division within Credit and Investment Banking.
            </Text>
        </Text>
    )
}


export function AboutModal() {
    return (
            <Button
                rightSection={<FontAwesomeIcon icon={faUser} className={styles.icon}/>}
                onClick={() => {
                    modals.open({
                    size: 'lg',
                    title: <Title order={4} className={styles.title}>About Me</Title>,
                    children: (
                        <>
                        <AboutText />
                        <Button fullWidth onClick={() => modals.closeAll()} mt="md">
                            Exit ↩️
                        </Button>
                        </>
                    ),
                    withCloseButton: true,
                    });
                }}
                autoContrast
                className={styles.button}
                radius="12.5%"
                fullWidth
                size="xl"
                >
         About
    </Button>
    );
}