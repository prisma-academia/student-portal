import { useMemo } from 'react';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import SchoolIcon from '@mui/icons-material/School';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";



const useNavConfig = () => {


    const navConfig = useMemo(() => [
        {
            title: 'home',
            path: '/',
            icon: <SpaceDashboardIcon />,
        },
        {
            title: 'school',
            path: '/school',
            icon: <SchoolIcon />,
        },
        {
            title: 'resource',
            path: '/resource',
            icon: <AutoFixHighIcon />,
        }
    ], []);

    return navConfig;
};

export default useNavConfig;