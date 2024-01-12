interface ILogManager {
    logInfoMsg(msg: string): Promise<void>;
    logError(e: Error): Promise<void>;
}
type ContractRecordVal = {
    id: string;
    isResponsibleManagerHire: boolean;
    defaultContactWay: string;
};
interface IContractManager {
    getContractsExpiredLaterThenDate(date: Date): Promise<ContractRecordVal[]>;
    updateProlongationOfferDateForContracts(contactids: string[]): Promise<void>;
}
interface IContractProlongationManager {
    offerContractsProlongationDefaultWay(contractIds: string[], contactWay: string | "default"): Promise<void>;
}
declare class ContractReviewService {
    private logManager;
    private contractManager;
    private contractsProlongationManager;
    constructor(logManager: ILogManager, contractManager: IContractManager, contractsProlongationManager: IContractProlongationManager);
    checkContractsProlongaion(date: Date): Promise<void>;
}
