export const filterDeposits = (accountNumber, deposits) => { 
    const searchedDeposits = deposits.filter(deposit => deposit.numero_conta === accountNumber);
    const orderedDeposits = searchedDeposits.sort((a, b) => {
        let dateA = new Date(a.data);
        let dateB = new Date(b.data);
        return dateA - dateB;
    });
    return orderedDeposits;
};

export const filterWithdraws = (accountNumber, withdraws) => { 
    const searchedWithdraws = withdraws.filter(withdraw => withdraw.numero_conta === accountNumber);
    const orderedWithdraws = searchedWithdraws.sort((a, b) => {
        let dateA = new Date(a.data);
        let dateB = new Date(b.data);
        return dateA - dateB;
    });
    return orderedWithdraws;
};

export const filterInboundTransfers = (accountNumber, transfers) => { 
    const searchedInboundTransfers = transfers.filter(transfer => transfer.numero_conta_destino === accountNumber);
    const orderedInboundTransfers = searchedInboundTransfers.sort((a, b) => {
        let dateA = new Date(a.data);
        let dateB = new Date(b.data);
        return dateA - dateB;
    });
    return orderedInboundTransfers;
};

export const filterOutgoingTransfers = (accountNumber, transfers) => { 
    const searchedOutgoingTransfers = transfers.filter(transfer => transfer.numero_conta_origem === accountNumber);
    const orderedOutgoingTransfers = searchedOutgoingTransfers.sort((a, b) => {
        let dateA = new Date(a.data);
        let dateB = new Date(b.data);
        return dateA - dateB;
    });
    return orderedOutgoingTransfers;
};

