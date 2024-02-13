export const validateUserData = (name, cpf, birth_date, phone, email, password) => { 
    let success = true;
    let message = "";

    if (!name.trim()) {
        success = false;
        message = "O campo nome é obrigatório.";
        return {
            success,
            message
        };
    };

    if (!cpf.trim()) {
        success = false;
        message = "O campo CPF é obrigatório.";
        return {
            success,
            message
        };
    };

    if (!birth_date.trim()) {
        success = false;
        message = "O campo data de nascimento é obrigatório.";
        return {
            success,
            message
        };
    };

    if (!phone.trim()) {
        success = false;
        message = "O campo telefone é obrigatório.";
        return {
            success,
            message
        };
    };

    if (!email.trim()) {
        success = false;
        message = "O campo e-mail é obrigatório.";
        return {
            success,
            message
        };
    };

    if (!password.trim()) {
        success = false;
        message = "O campo senha é obrigatório.";
        return {
            success,
            message
        };
    };

    return {
        success,
        message
    };
};

export const validateUniqueCpf = (accounts, cpf) => {
    const repeatedCpf = accounts.find(account => account.usuario.cpf === cpf);
    
    if (repeatedCpf) {
        return false;
    } else {
        return true;
    }
};

export const validateUniqueEmail = (accounts, email) => {
    const repeatedEmail = accounts.find(account => account.usuario.email === email);

    if (repeatedEmail) {
        return false;
    } else {
        return true;
    }
}

export const validateAccountNumber = (accounts, accountNumber) => {
    let success = true;
    let code = 200;
    let message = "";

    if (!accountNumber) {
        success = false;
        code = 400;
        message = "O campo número da conta é obrigatório.";
        return {
            success,
            code,
            message
        };
    };

    if (isNaN(accountNumber)) {
        success = false;
        code = 400;
        message = "O número da conta não é um número válido.";
        return {
            success,
            code,
            message
        };
    };

    const searchedAccount = accounts.find(account => account.numero === accountNumber);
    const accountIndex = accounts.findIndex(account => account.numero === accountNumber);

    if (!searchedAccount) {
        success = false;
        code = 404;
        message = "Não existe uma conta com o número da conta informado.";
        return {
            success,
            code,
            message
        };
    };

    return {
        success,
        code,
        message, 
        searchedAccount,
        accountIndex
    };
}

export const validateTransactionValue = (value) => { 
    let success = true;
    let message = "";

    if (!value) {
        success = false;
        message = "O campo valor é obrigatório.";
        return {
            success,
            message
        };
    };

    if (value === 0) {
        success = false;
        message = "O valor para transação não pode ser 0";
        return {
            success,
            message
        };
    };

    if (value < 0) {
        success = false;
        message = "O valor para transação não pode ser negativo";
        return {
            success,
            message
        };
    };

    return {
        success,
        message
    };
};

export const validatePassword = (account, password) => { 
    if (account.usuario.senha !== password) {
        return false;
    } else {
        return true;
    }
};

export const validateTransactionPossibility = (account, value) => { 
    if (account.saldo < value) {
        return false;
    } else {
        return true;
    }
};