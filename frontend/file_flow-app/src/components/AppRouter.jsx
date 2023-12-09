import React from 'react';
import {Route, Routes, Navigate} from 'react-router-dom';
import { appRoutes } from '../router/router';

const AppRouter = () => {
    return (
        <div>
            <Routes>
                {appRoutes.map(route =>
                    <Route key={route.id} element={route.element} path={route.path} exact={route.exact}/>
                )}
                <Route
                    path="*"
                    elemt={<Navigate to="/login" replace/>}
                />
            </Routes>
        </div>
    );
}

export default AppRouter;
