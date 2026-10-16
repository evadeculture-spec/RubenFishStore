import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/public/Home';
import { Plans } from './pages/public/Plans';
import { BoxDetail } from './pages/public/BoxDetail';
import { HowItWorks } from './pages/public/HowItWorks';
import { RewardsPublic } from './pages/public/RewardsPublic';
import { DemoAbout } from './pages/public/DemoAbout';
import { Checkout } from './pages/public/Checkout';
import { CheckoutDone } from './pages/public/CheckoutDone';
import { NotFound } from './pages/public/NotFound';
import { AccountLayout } from './pages/account/AccountLayout';
import { Overview } from './pages/account/Overview';
import { SubscriptionPage } from './pages/account/SubscriptionPage';
import { OrderDetail, Orders } from './pages/account/Orders';
import { Profile } from './pages/account/Profile';
import { RewardsAccount } from './pages/account/RewardsAccount';
import { GuideDetail, Learn } from './pages/account/Learn';
import { Challenges } from './pages/account/Challenges';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminCustomerDetail, AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminOrderDetail, AdminOrders } from './pages/admin/AdminOrders';
import { AdminEditionEdit, AdminEditions } from './pages/admin/AdminEditions';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminRewards } from './pages/admin/AdminRewards';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/planos', element: <Plans /> },
      { path: '/box/:planId', element: <BoxDetail /> },
      { path: '/como-funciona', element: <HowItWorks /> },
      { path: '/recompensas', element: <RewardsPublic /> },
      { path: '/demonstracao', element: <DemoAbout /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/checkout/confirmado/:orderId', element: <CheckoutDone /> },
      {
        path: '/conta',
        element: <AccountLayout />,
        children: [
          { index: true, element: <Overview /> },
          { path: 'subscricao', element: <SubscriptionPage /> },
          { path: 'encomendas', element: <Orders /> },
          { path: 'encomendas/:id', element: <OrderDetail /> },
          { path: 'perfil', element: <Profile /> },
          { path: 'recompensas', element: <RewardsAccount /> },
          { path: 'aprender', element: <Learn /> },
          { path: 'aprender/:guideId', element: <GuideDetail /> },
          { path: 'desafios', element: <Challenges /> },
        ],
      },
      {
        path: '/gestao',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOverview /> },
          { path: 'clientes', element: <AdminCustomers /> },
          { path: 'clientes/:id', element: <AdminCustomerDetail /> },
          { path: 'encomendas', element: <AdminOrders /> },
          { path: 'encomendas/:id', element: <AdminOrderDetail /> },
          { path: 'edicoes', element: <AdminEditions /> },
          { path: 'edicoes/:id', element: <AdminEditionEdit /> },
          { path: 'produtos', element: <AdminProducts /> },
          { path: 'recompensas', element: <AdminRewards /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
