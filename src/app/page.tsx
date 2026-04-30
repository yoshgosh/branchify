import { auth } from '@/auth';
import GraphPage from './graph-page/GraphPage';
import LoginPage from './login/LoginPage';

export default async function Home() {
    const session = await auth();
    if (!session) return <LoginPage />;
    return <GraphPage />;
}
