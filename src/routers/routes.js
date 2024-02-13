import express from 'express';
import { 
    listAccounts, 
    createAccount, 
    updateAccountUser, 
    deleteAccount, 
    makeDeposit, 
    makeWithdraw, 
    makeTransfer, 
    showBalance, 
    showStatement 
} from '../controllers/controllers.js';
import { passwordValidation } from '../middlewares/middlewares.js';

const routes = express();

routes.get('/contas', passwordValidation, listAccounts);
routes.post('/contas', createAccount);
routes.put('/contas/:numeroConta/usuario', updateAccountUser);
routes.delete('/contas/:numeroConta', deleteAccount);
routes.post('/transacoes/depositar', makeDeposit);
routes.post('/transacoes/sacar', makeWithdraw);
routes.post('/transacoes/transferir', makeTransfer);
routes.get('/contas/saldo', showBalance);
routes.get('/contas/extrato', showStatement);

export default routes;