export interface ILogManager {
    logInfoMsg(msg: string): Promise<void>
    logError(e: Error): Promise<void>
}

export type ContractRecordVal = {
    id: string
    isResponsibleManagerHire: boolean
    defaultContactWay: string
}

export interface IContractManager {
    getContractsExpiredLaterThenDate(date: Date): Promise<ContractRecordVal[]>
    updateProlongationOfferDateForContracts(contactids: string[]): Promise<void>
}

export interface IContractProlongationManager {
    offerContractsProlongationDefaultWay(
        contractIds: string[],
        contactWay: string | "default"
    ): Promise<void>
}

export class ContractReviewService {
    private logManager: ILogManager
    private contractManager: IContractManager
    private contractsProlongationManager: IContractProlongationManager

    constructor(
        logManager: ILogManager,
        contractManager: IContractManager,
        contractsProlongationManager: IContractProlongationManager
    ) {
        this.logManager = logManager
        this.contractManager = contractManager
        this.contractsProlongationManager = contractsProlongationManager
    }

    public async checkContractsProlongaion(date: Date): Promise<void> {
        const dateMatchContacts = this.contractManager.getContractsExpiredLaterThenDate(date)
        const contractsToProlongation = (await dateMatchContacts)
            .filter(c => c.isResponsibleManagerHire)
        const contractsMappedByProlongationWay: Record<string, string[]> = {}
        contractsToProlongation.forEach(c => {
            const contWay = !!c.defaultContactWay ? c.defaultContactWay : "default"
            if (Object.keys(contractsMappedByProlongationWay).indexOf(contWay) === -1) {
                contractsMappedByProlongationWay[contWay] = [c.id];
            } else {
                contractsMappedByProlongationWay[contWay].push(c.id);
            }
        })
        const allProlongationWayGroups = Object.keys(contractsMappedByProlongationWay)
        for (let i = 0; i < allProlongationWayGroups.length; i++) {
            try {
                await this.contractsProlongationManager.offerContractsProlongationDefaultWay(
                    contractsMappedByProlongationWay[allProlongationWayGroups[i]],
                    allProlongationWayGroups[i]
                )
                await this.logManager.logInfoMsg("Contracts with ids "
                    + contractsMappedByProlongationWay[allProlongationWayGroups[i]]
                    + "had beent dent to prolongation by " + allProlongationWayGroups[i])
                await this.contractManager.updateProlongationOfferDateForContracts(
                    contractsMappedByProlongationWay[allProlongationWayGroups[i]]
                )
            } catch (e) {
                await this.logManager.logError(e)
            }
        }
        return Promise.resolve()
    }
}