import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Components/AuthContext';
import Navbar from './Components/Navbar/Navbar';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import Supplier from './Components/Supplier';
import Seller from './Components/Seller';
import Reseller from './Components/Reseller';
import Exporter from './Components/Exporter';
import ElseNavbar from './Components/ElseNavbar/ElseNavbar';
import Admin from './Components/Admin';
import AdminRegister from './Components/AdminRegister/AdminRegister';
import PendingUser from '../src/Components/PendingUser/PendingUser';
import BSaddproduct from './Components/BSaddproduct/BSaddproduct';
import RSaddproduct from './Components/RSaddproduct/RSaddproduct';
import Shop from './Components/Shop';
import BSproductlist from './Components/BSproductlist/BSproductlist';
import RSproductlsit from './Components/RSproductlist/RSproductlist';
import Sproductlsit from './Components/Sproductlist/Sproductlist';
import ProductDisplay from './Components/ProductsDisplay/ProductsDisplay';
import BSproducts from './Components/BSproducts/BSproducts';
import PRODUCTSSS from './Components/PRODUCTSSS';
import EXproductlist from './Components/EXproductlist/EXproductlist';
import RSproductdisplay from './Components/RSproductdisplay/RSproductdisplay';
import EXproductdisplay from './Components/EXproductdisplay/EXproductdisplay';
import SproductDisplay from './Components/SproductDisplay/SproductDisplay';
import CartPage from './Components/CartPage/CartPage';
import RecieptPage from './Components/RecieptPage/RecieptPage';
import Address from './Components/Address/Address';
import MyAdd from './Components/MyAdd/MyAdd';
import AccSetting from './Components/AccSetting/AccSetting';
import Order from './Components/Order/Order';
import UserOrder from './Components/UserOrder/UserOrder';
import OrderStatus from './Components/OrderStatus/OrderStatus';
import Driedfish from './Components/Driedfish';
import Gourmet from './Components/Gourmet';
import Rs from './Components/actors/RS';
import BS from './Components/actors/BS';
import EX from './Components/actors/EX';
import SS from './Components/actors/SS';
import CompleteOrder from './Components/CompleteOrder/CompleteOrder';
import RSCompleteOrder from './Components/RSCompleteOrder/RSCompleteOrder';
import SCompleteOrder from './Components/SCompleteOrder/SCompleteOrder';
import BScompleteorder from './Components/BScompleteOrder/BScompleteorder';
import ConsumerOrder from './Components/ConsumerOrder/ConsumerOrder';
import EXCompleteOrder from './Components/EXSCompleteOrder/EXSCompleteOrder';
import Archive from './Components/Archive/Archive';
import OrderShipped from './Components/OrderShipped/OrderShipped';
import BSArchive from './Components/BSArchive/BSArchive';
import RSArchive from './Components/RSArchive/RSArchive';
import EXarchive from './Components/EXarchive/EXarchive';
import Cancel from './Components/Cancel/Cancel';
import ProviderArchived from './Components/actors/providerarchived';
import BSprovider from './Components/actors/BSprovider';
import SSprovider from './Components/actors/SSprovider';
import EXprovider from './Components/actors/EXprovider';
import Nearby from './Components/Nearby/Nearby';
import AdminNavbar from './Components/AdminNavbar/AdminNavbar';
import ProviderProductDisplay from './Components/ProviderProductDisplay/ProviderProductDisplay';
import AllProductDisplay from './Components/AllProductDisplay/AllProductDisplay';
import ToRecieve from './Components/ToRecieved/ToRecieve';
import ToReceiveConsumer from './Components/toReceiveConsumer/toReceiveConsumer';
import AlreadyReceived from './Components/toReceiveConsumer/AlreadyReceived';
import Consumer from './Components/actors/Consumers';
import ReceivalP from './Components/ReceivalP/ReceivalP';
import HomeSeller from './Components/HomeSeller/HomeSeller';
import SupplierHome from './Components/SupplierHome/SupplierHome';
import ProductionManagement from './Components/ProductionManagement/ProductionManagement';
import ProductManagement from './Components/ProductManagement/ProductManagement';
import SSandRS from './Components/SSansRS/SSandRS';
import RSSSnavbar from './Components/RSSSnavbar/RSSSnavbar';
import SellersAddress from './Components/SellersAdress/SellersAddress';
import ProviderAccSetting from './Components/AccSetting/ProviderAccSetting';
import MyAddSellers from './Components/MyAddSellers/MyAddSellers';
import SupplierNearby from './Components/SupplierNearby/SupplierNearby';
import SupplierProductDisplay from './Components/SupplierProductDisplay/SupplierProductDisplay';
import SupplierAllProductsDisplay from './Components/SupplierAllProductDisplay/SupplierAllProductDisplay';
import SellerOrder from './Components/SellerOrder/SellerOrder';
import SupplierOrders from './Components/SupplierOrders/SupplierOrders';
import SalesManagement from './Components/SalesManagement/SalesManagement';
import SupplierAccepted from './Components/SupplierAccepted/SupplierAccepted';
import SupplierCancelledOrder from './Components/SupplierCancelledOrders/SupplierCancelledOrders';
import InventoryManagement from './Components/InventoryManagement/InventoryManagement';
import ResellerNavbar from './Components/ResellerNavbar/ResellerNavbar';
import ResellerHome from './Components/ResellerHome';
import Resellermapping from './Components/Resellermapping/Resellermapping';
import SellerProductDisplay from './Components/SellerProductDisplay/SellerProductDisplay';
import SellerAllProductDisplay from './Components/SellerAllProductDisplay/SellerAllProductDisplay';
import exporterconsumer from './Components/exporterconsumer';
import Exporternavbar from './Components/Exporternavbar/Exporternavbar';
import Exporteraccsetting from './Components/AccSetting/Exprteraccsetting';
import ExporterAddress from './Components/Address/ExporterAddress';
import ExporterAdd from './Components/MyAdd/ExporterAdd';
import ExporterCartPage from './Components/CartPage/ExporterCartPage';
import ExporterOrder from './Components/Order/ExporterOrder';
import ExporterOrderShipped from './Components/OrderShipped/ExporterOrderShipped';
import ExporterToReceiveConsumer from './Components/toReceiveConsumer/ExportertoReceiveConsumer';
import ExporterCancel from './Components/Cancel/ExporterCancel';
import ExporterAlreadyReceived from './Components/toReceiveConsumer/ExporterAlreadyReceived';
import ExporterReceiptPage from './Components/RecieptPage/ExporterReceiptPage';
import ExporterAllProductsDisplay from './Components/AllProductDisplay/ExportersAllProductDisplay';
import ExportersAllProductsDisplay from './Components/AllProductDisplay/ExportersAllProductDisplay';
import ExporterBSproducts from './Components/BSproducts/ExporterBSproducts';
import ExporterRSproducts from './Components/RSproducts/ExporterRSproducts';
import SupplierRSproducts from './Components/RSproducts/SupplierRSproducts';
import ExporterSupplierAllProductDisplay from './Components/SupplierAllProductDisplay/ExporterSupplierAllProductDisplay';
import ExporterSellerOrder from './Components/SellerOrder/ExporterSellerOrder';
import SellerNav from './Components/SellerNav/SellerNav';
import ForSeller from './Components/RSproducts/ForSeller';
import SupplierNavbar from './Components/ElseNavbar/SupplierNavbar';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/register" element={<AdminRegister />} />
          <Route path="/consumer" element={<ProtectedRoute component={<Shop />} />} />
          <Route path="/supplier" element={<ProtectedRoute component={<Supplier />} />} />
          <Route path="/seller" element={<ProtectedRoute component={<Seller />} />} />
          <Route path="/reseller" element={<ProtectedRoute component={<Reseller />} />} />
          <Route path="/exporter" element={<ProtectedRoute component={<Exporter />} />} />
          <Route path="/else" element={<ProtectedRoute component={<ElseNavbar />} />} />
          <Route path="/admin" element={<ProtectedRoute component={<Admin />} />} />
          <Route path="/pendinguser" element={<ProtectedRoute component={<PendingUser />} />} />
          <Route path="/addproduct" element={<ProtectedRoute component={<BSaddproduct />} />} />
          <Route path="/rsaddproduct" element={<ProtectedRoute component={<RSaddproduct />} />} />
          <Route path="/productlist" element={<ProtectedRoute component={<BSproductlist />} />} />
          <Route path="/rsproductlist" element={<ProtectedRoute component={<RSproductlsit />} />} />
          <Route path="/sproductlist" element={<ProtectedRoute component={<Sproductlsit />} />} />
          <Route path="/exproductlist" element={<ProtectedRoute component={<EXproductlist />} />} />
          <Route path="/productdisplay/:id" element={<ProtectedRoute component={<ProductDisplay />} />} />
          <Route path="/rsproductdisplay/:id" element={<ProtectedRoute component={<RSproductdisplay />} />} />
          <Route path="/exproductdisplay/:id" element={<ProtectedRoute component={<EXproductdisplay />} />} />
          <Route path="/sproductdisplay/:id" element={<ProtectedRoute component={<SproductDisplay />} />} />
          <Route path="/ppp" element={<ProtectedRoute component={<BSproducts />} />} />
          <Route path="/ppppp" element={<ProtectedRoute component={<PRODUCTSSS />} />} />
          <Route path="/cart" element={<ProtectedRoute component={<CartPage />} />} />
          <Route path="/receipt" element={<ProtectedRoute component={<RecieptPage />} />} />
          <Route path="/address" element={<ProtectedRoute component={<Address />} />} />
          <Route path="/myaddress" element={<ProtectedRoute component={<MyAdd />} />} />
          <Route path="/accsetting" element={<ProtectedRoute component={<AccSetting />} />} />
          <Route path="/order" element={<ProtectedRoute component={<Order />} />} />
          <Route path="/mypurchase" element={<ProtectedRoute component={<Order />} />} />
          <Route path="/userorder" element={<ProtectedRoute component={<UserOrder />} />} />
          <Route path="/stat" element={<ProtectedRoute component={<OrderStatus />} />} />
          <Route path="/driedfish" element={<ProtectedRoute component={<Driedfish />} />} />
          <Route path="/gourmet" element={<ProtectedRoute component={<Gourmet />} />} />
          <Route path="/rsellers" element={<ProtectedRoute component={<Rs />} />} />
          <Route path="/bs" element={<ProtectedRoute component={<BS />} />} />
          <Route path="/ex" element={<ProtectedRoute component={<EX />} />} />
          <Route path="/ss" element={<ProtectedRoute component={<SS />} />} />
          <Route path="/completeorder" element={<ProtectedRoute component={<CompleteOrder />} />} />
          <Route path="/rscompleteorder" element={<ProtectedRoute component={<RSCompleteOrder />} />} />
          <Route path="/scompleteorder" element={<ProtectedRoute component={<SCompleteOrder />} />} />
          <Route path="/exscompleteorder" element={<ProtectedRoute component={<EXCompleteOrder />} />} />
          <Route path="/bscompleteorder" element={<ProtectedRoute component={<BScompleteorder />} />} /> 
          <Route path="/shippedorders" element={<ProtectedRoute component={<ConsumerOrder />} />} />
          <Route path="/archive" element={<ProtectedRoute component={<Archive />} />} />
          <Route path="/nashipna" element={<ProtectedRoute component={<OrderShipped />} />} />
          <Route path="/bsarchive" element={<ProtectedRoute component={<BSArchive />} />} />
          <Route path="/rsarchive" element={<ProtectedRoute component={<RSArchive />} />} />
          <Route path="/exarchive" element={<ProtectedRoute component={<EXarchive />} />} />
          <Route path="/cancel" element={<ProtectedRoute component={<Cancel />} />} />
          <Route path="/bsprovider" element={<ProtectedRoute component={<BSprovider />} />} />
          <Route path="/ssprovider" element={<ProtectedRoute component={<SSprovider />} />} />
          <Route path="/exprovider" element={<ProtectedRoute component={<EXprovider />} />} />
          <Route path="/providerarchived" element={<ProtectedRoute component={<ProviderArchived />} />} />
          <Route path="/nearby" element={<ProtectedRoute component={<Nearby />} />} />
          <Route path="/adminnavbar" element={<ProtectedRoute component={<AdminNavbar />} />} />
          <Route path="/providerproductdisplay/:userId" element={<ProtectedRoute component={<ProviderProductDisplay />} />} />
          <Route path="/allproductdisplay/:id" element={<ProtectedRoute component={<AllProductDisplay />} />} />
          <Route path="/torecievenasya" element={<ProtectedRoute component={<ToRecieve />} />} />
          <Route path="/torecieveconsumer" element={<ProtectedRoute component={<ToReceiveConsumer/>} />} />
          <Route path="/recievedconsumer" element={<ProtectedRoute component={<AlreadyReceived/>} />} />
          <Route path="/allconsumer" element={<ProtectedRoute component={<Consumer/>} />} />
          <Route path="/providerreceival" element={<ProtectedRoute component={<ReceivalP/>} />} />
          <Route path="/homeseller" element={<ProtectedRoute component={<HomeSeller/>} />} />
          <Route path="/SupplierHome" element={<ProtectedRoute component={<SupplierHome/>} />} />
          <Route path="/ProductionManagement" element={<ProtectedRoute component={<ProductionManagement/>} />} />
          <Route path="/productmanagement" element={<ProtectedRoute component={<ProductManagement/>} />} />
          <Route path="/ssandrs" element={<ProtectedRoute component={<SSandRS/>} />} />
          <Route path="/rsssnavbar" element={<ProtectedRoute component={<RSSSnavbar/>} />} />
          <Route path="/sellersaddress" element={<ProtectedRoute component={<SellersAddress/>} />} />
          <Route path="/provsetting" element={<ProtectedRoute component={<ProviderAccSetting/>} />} />
          <Route path="/myaddseller" element={<ProtectedRoute component={<MyAddSellers/>} />} />
          <Route path="/suppliernearby" element={<ProtectedRoute component={<SupplierNearby/>} />} />
          <Route path="/supplierproductdisplay/:userId" element={<ProtectedRoute component={<SupplierProductDisplay/>} />} />
          <Route path="/supplierallproductdisplay/:id" element={<ProtectedRoute component={<SupplierAllProductsDisplay/>} />} />
          <Route path="/sellerorder" element={<ProtectedRoute component={<SellerOrder/>} />} />
          <Route path="/supplierorders" element={<ProtectedRoute component={<SupplierOrders/>} />} />
          <Route path="/salesmanagement" element={<ProtectedRoute component={<SalesManagement/>} />} />
          <Route path="/salesmanagementaccepted" element={<ProtectedRoute component={<SupplierAccepted/>} />} />
          <Route path="/salesmanagementcancelled" element={<ProtectedRoute component={<SupplierCancelledOrder/>} />} />
          <Route path="/inventorymanagement" element={<ProtectedRoute component={<InventoryManagement/>} />} />
          <Route path="/resellersnavbar" element={<ProtectedRoute component={<ResellerNavbar/>} />} />
          <Route path="/resellershome" element={<ProtectedRoute component={<ResellerHome/>} />} />
          <Route path="/resellersmapping" element={<ProtectedRoute component={<Resellermapping/>} />} />
          <Route path="/resellerssellerproduct/:userId" element={<ProtectedRoute component={<SellerProductDisplay/>} />} />
          <Route path="/allresellerssellerproduct/:id" element={<ProtectedRoute component={<SellerAllProductDisplay/>} />} />
          <Route path="/exporterconsumer" element={<ProtectedRoute component={<exporterconsumer/>} />} />
          <Route path="/exporternavbar" element={<ProtectedRoute component={<Exporternavbar/>} />} />
          <Route path="/exporteraccsetting" element={<ProtectedRoute component={<Exporteraccsetting/>} />} />
          <Route path="/exporteradd" element={<ProtectedRoute component={<ExporterAddress/>} />} />
          <Route path="/exportermyadd" element={<ProtectedRoute component={<ExporterAdd/>} />} />
          <Route path="/exportercart" element={<ProtectedRoute component={<ExporterCartPage/>} />} />
          <Route path="/exporterorder" element={<ProtectedRoute component={<ExporterOrder/>} />} />
          <Route path="/exporternashipna" element={<ProtectedRoute component={<ExporterOrderShipped/>} />} />
          <Route path="/exportertorecieveconsumer" element={<ProtectedRoute component={<ExporterToReceiveConsumer/>} />} />
          <Route path="/exportercancel" element={<ProtectedRoute component={<ExporterCancel/>} />} />
          <Route path="/exporterrecievedconsumer" element={<ProtectedRoute component={<ExporterAlreadyReceived/>} />} />
          <Route path="/exporterreceipt" element={<ProtectedRoute component={<ExporterReceiptPage/>} />} />
          <Route path="/exporterallproductdisplay/:id" element={<ProtectedRoute component={<ExportersAllProductsDisplay/>} />} />
          <Route path="/exporterbsproducts" element={<ProtectedRoute component={<ExporterBSproducts/>} />} />
          <Route path="/exporterrsproducts" element={<ProtectedRoute component={<ExporterRSproducts/>} />} />
          <Route path="/supplierrsproducts" element={<ProtectedRoute component={<SupplierRSproducts/>} />} />
          <Route path="/exportersellerorder" element={<ProtectedRoute component={<ExporterSellerOrder/>} />} />
          <Route path="/exportersssallproductdisplay/:id" element={<ProtectedRoute component={<ExporterSupplierAllProductDisplay/>} />} />
          <Route path="/sellernav" element={<ProtectedRoute component={<SellerNav/>} />} />
          <Route path="/forseller" element={<ProtectedRoute component={<ForSeller/>} />} />
          <Route path="/suppliernav" element={<ProtectedRoute component={<SupplierNavbar/>} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const ProtectedRoute = ({ component }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated() ? (
    component
  ) : (
    <Navigate to="/login" />
  );
};

export default App;
