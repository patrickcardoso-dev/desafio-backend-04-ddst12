import { 
    readJsonFile, 
    partiallyRewriteJsonFile 
} from "../utils/fs-functions.js";
import { 
    validateUserData, 
    validateUniqueCpf, 
    validateUniqueEmail, 
    validateAccountNumber, 
    validateTransactionValue, 
    validatePassword, 
    validateTransactionPossibility 
} from "../utils/validation-functions.js";
import { 
    filterDeposits,
    filterWithdraws,
    filterInboundTransfers,
    filterOutgoingTransfers
} from "../utils/filter-functions.js";
import { format } from "date-fns";


export const listAccounts = async (req, res) => {
    try {
        const { contas } = await readJsonFile();
        return res.status(200).json(contas);
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}

export const createAccount = async (req, res) => {
    try {
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
        const { banco, contas } = await readJsonFile();

        const dataValidation = validateUserData(nome, cpf, data_nascimento, telefone, email, senha);
        if (!dataValidation.success) {
            return res.status(400).json({ mensagem: dataValidation.message });
        };

        const cpfValidation = validateUniqueCpf(contas, cpf.trim());
        if (!cpfValidation) {
            return res.status(400).json({ mensagem: "Este CPF já está cadastrado." });
        };

        const emailValidation = validateUniqueEmail(contas, email.trim());
        if (!emailValidation) {
            return res.status(400).json({ mensagem: "Este e-mail já está cadastrado." });
        };

        banco.contas_cadastradas++;
        await partiallyRewriteJsonFile({ banco });
    
        const newAccount = {
            numero: banco.contas_cadastradas,
            saldo: 0,
            usuario: {
                nome,
                cpf,
                data_nascimento,
                telefone,
                email,
                senha
            }
        };

        contas.push(newAccount);
        await partiallyRewriteJsonFile({ contas });

        return res.status(201).send(newAccount);
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}

export const updateAccountUser = async (req, res) => {
    try {
        const numeroConta = Number(req.params.numeroConta);
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
        const { contas } = await readJsonFile();

        const accountNumberValidation = validateAccountNumber(contas, numeroConta);
        if (!accountNumberValidation.success) {
            return res.status(accountNumberValidation.code).json({ mensagem: accountNumberValidation.message });
        };

        const dataValidation = validateUserData(nome, cpf, data_nascimento, telefone, email, senha);
        if (!dataValidation.success) {
            return res.status(400).json({ mensagem: dataValidation.message });
        };

        const cpfValidation = validateUniqueCpf(contas, cpf.trim());
        if (!cpfValidation) {
            return res.status(400).json({ mensagem: "Este CPF já está cadastrado." });
        };

        const emailValidation = validateUniqueEmail(contas, email.trim());
        if (!emailValidation) {
            return res.status(400).json({ mensagem: "Este e-mail já está cadastrado." });
        };

        const { searchedAccount, accountIndex } = accountNumberValidation;
        const updatedUserData = { 
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }

        const updatedAccount = {
            ...searchedAccount,
            usuario: updatedUserData
        }

        contas.splice(accountIndex, 1, updatedAccount);
        await partiallyRewriteJsonFile({ contas });

        return res.status(200).json({ mensagem: "Conta atualizada com sucesso!" });
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const numeroConta = Number(req.params.numeroConta);
        const { contas } = await readJsonFile();

        const accountNumberValidation = validateAccountNumber(contas, numeroConta);
        if (!accountNumberValidation.success) {
            return res.status(accountNumberValidation.code).json({ mensagem: accountNumberValidation.message });
        };

        const { searchedAccount, accountIndex } = accountNumberValidation;

        if (searchedAccount.saldo !== 0) {
            return res.status(400).json({ mensagem: "O saldo da conta deve ser zerado antes de efetuar a exclusão!" });
        }

        contas.splice(accountIndex, 1);
        await partiallyRewriteJsonFile({ contas });

        return res.status(200).json({ mensagem: "Conta excluída com sucesso!" });
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}

export const makeDeposit = async (req, res) => {
    try {
        const { numero_conta, valor } = req.body;
        const { contas, depositos } = await readJsonFile();

        const accountNumberValidation = validateAccountNumber(contas, Number(numero_conta));
        if (!accountNumberValidation.success) {
            return res.status(accountNumberValidation.code).json({ mensagem: accountNumberValidation.message });
        };

        const valueValidation = validateTransactionValue(valor);
        if (!valueValidation.success) {
            return res.status(400).json({ mensagem: valueValidation.message });
        };

        const { searchedAccount, accountIndex } = accountNumberValidation;

        const updatedBalance = searchedAccount.saldo += valor;
        const updatedAccountBalance = {
            ...searchedAccount,
            saldo: updatedBalance
        }
        contas.splice(accountIndex, 1, updatedAccountBalance);
        await partiallyRewriteJsonFile({ contas });

        const depositDate = new Date();
        const formatedDepositDate = format(depositDate, "yyyy-MM-dd HH:mm:ss"); 
        const depositRecord = {
            data: formatedDepositDate,
            numero_conta,
            valor
        }
        depositos.push(depositRecord);
        await partiallyRewriteJsonFile({ depositos });

        return res.status(200).json({ mensagem: "Depósito realizado com sucesso!" });
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}

export const makeWithdraw = async (req, res) => {
    try {
        const { numero_conta, valor, senha } = req.body;
        const { contas, saques } = await readJsonFile();

        const accountNumberValidation = validateAccountNumber(contas, Number(numero_conta));
        if (!accountNumberValidation.success) {
            return res.status(accountNumberValidation.code).json({ mensagem: accountNumberValidation.message });
        };

        const valueValidation = validateTransactionValue(valor);
        if (!valueValidation.success) {
            return res.status(400).json({ mensagem: valueValidation.message });
        };

        const { searchedAccount, accountIndex } = accountNumberValidation;

        const passwordValidation = validatePassword(searchedAccount, senha);
        if (!passwordValidation) {
            return res.status(400).json({ mensagem: "A senha informada está incorreta." });
        };

        const transactionValidation = validateTransactionPossibility(searchedAccount, valor);
        if (!transactionValidation) {
            return res.status(400).json({ mensagem: "Saldo insuficiente para realizar transação." });
        };

        const updatedBalance = searchedAccount.saldo -= valor;
        const updatedAccountBalance = {
            ...searchedAccount,
            saldo: updatedBalance
        }
        contas.splice(accountIndex, 1, updatedAccountBalance);
        await partiallyRewriteJsonFile({ contas });

        const withdrawDate = new Date();
        const formatedWithdrawDate = format(withdrawDate, "yyyy-MM-dd HH:mm:ss"); 
        const withdrawRecord = {
            data: formatedWithdrawDate,
            numero_conta,
            valor
        }
        saques.push(withdrawRecord);
        await partiallyRewriteJsonFile({ saques }); 

        return res.status(200).json({ mensagem: "Saque realizado com sucesso!" });
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}

export const makeTransfer = async (req, res) => {
    try {
        const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
        const { contas, transferencias } = await readJsonFile();

        const originAccountNumberValidation = validateAccountNumber(contas, Number(numero_conta_origem));
        if (!originAccountNumberValidation.success) {
            const detailedMessage = `Conta de origem: ${originAccountNumberValidation.message}`;
            return res.status(originAccountNumberValidation.code).json({ mensagem: detailedMessage });
        };

        const destinyAccountNumberValidation = validateAccountNumber(contas, Number(numero_conta_destino));
        if (!destinyAccountNumberValidation.success) {
            const detailedMessage = `Conta de destino: ${destinyAccountNumberValidation.message}`;
            return res.status(destinyAccountNumberValidation.code).json({ mensagem: detailedMessage });
        };

        const valueValidation = validateTransactionValue(valor);
        if (!valueValidation.success) {
            return res.status(400).json({ mensagem: valueValidation.message });
        };

        const { searchedAccount: originAccount, accountIndex: originAccountIndex } = originAccountNumberValidation;
        const { searchedAccount: destinyAccount, accountIndex: destinyAccountIndex } = destinyAccountNumberValidation;

        const passwordValidation = validatePassword(originAccount, senha);
        if (!passwordValidation) {
            return res.status(400).json({ mensagem: "A senha informada está incorreta." });
        };

        const transactionValidation = validateTransactionPossibility(originAccount, valor);
        if (!transactionValidation) {
            return res.status(400).json({ mensagem: "Saldo insuficiente para realizar transação." });
        };

        const updatedOriginBalance = originAccount.saldo -= valor;
        const updatedOriginAccountBalance = {
            ...originAccount,
            saldo: updatedOriginBalance
        }
        contas.splice(originAccountIndex, 1, updatedOriginAccountBalance);

        const updatedDestinyBalance = destinyAccount.saldo += valor;
        const updatedDestinyAccountBalance = {
            ...destinyAccount,
            saldo: updatedDestinyBalance
        }
        contas.splice(destinyAccountIndex, 1, updatedDestinyAccountBalance);

        await partiallyRewriteJsonFile({ contas });

        const transferDate = new Date();
        const formatedTransferDate = format(transferDate, "yyyy-MM-dd HH:mm:ss"); 
        const transferRecord = {
            data: formatedTransferDate,
            numero_conta_origem,
            numero_conta_destino,
            valor
        }
        transferencias.push(transferRecord);
        await partiallyRewriteJsonFile({ transferencias }); 

        return res.status(200).json({ mensagem: "Transferência realizada com sucesso!" });
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}

export const showBalance = async (req, res) => {
    try {
        const { numero_conta, senha } = req.query;
        const { contas } = await readJsonFile();

        const accountNumberValidation = validateAccountNumber(contas, Number(numero_conta));
        if (!accountNumberValidation.success) {
            return res.status(accountNumberValidation.code).json({ mensagem: accountNumberValidation.message });
        };

        const { searchedAccount } = accountNumberValidation;

        const passwordValidation = validatePassword(searchedAccount, senha);
        if (!passwordValidation) {
            return res.status(400).json({ mensagem: "A senha informada está incorreta." });
        };

        return res.status(200).json({ saldo: searchedAccount.saldo });
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}

export const showStatement = async (req, res) => {
    try {
        const { numero_conta, senha } = req.query;
        const { contas, depositos, saques, transferencias } = await readJsonFile();

        const accountNumberValidation = validateAccountNumber(contas, Number(numero_conta));
        if (!accountNumberValidation.success) {
            return res.status(accountNumberValidation.code).json({ mensagem: accountNumberValidation.message });
        };

        const { searchedAccount } = accountNumberValidation;

        const passwordValidation = validatePassword(searchedAccount, senha);
        if (!passwordValidation) {
            return res.status(400).json({ mensagem: "A senha informada está incorreta." });
        };

        const deposits = filterDeposits(numero_conta, depositos);
        const withdraws = filterWithdraws(numero_conta, saques);
        const inboundTransfers = filterInboundTransfers(numero_conta, transferencias);
        const outgoingTransfers = filterOutgoingTransfers(numero_conta, transferencias);

        const statement = {
            depositos: deposits,
            saques: withdraws,
            transferenciasRecebidas: inboundTransfers,
            transferenciasEnviadas: outgoingTransfers
        }

        return res.status(200).json(statement);
    } catch (error) {
        return res.status(400).json({ Erro: error.message });
    }
}