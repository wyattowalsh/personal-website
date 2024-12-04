declare module 'super-react-gist' {
    interface SuperReactGistProps {
        url: string;
        loading?: string | React.ReactNode;
        style?: React.CSSProperties;
    }

    const SuperReactGist: React.FC<SuperReactGistProps>;
    export default SuperReactGist;
}
