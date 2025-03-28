
class MonitoringController {

    constructor({responses, logger, transaction, monitoringModel}) {
        this.transaction = transaction;
        this.logger = logger;
        this.responses = responses;
        this.monitoringModel = monitoringModel;
    }

    getMonitoringPastData = async (req, res) => {
        try {
            const registers = await this.monitoringModel.getMonitoringRecords();
            return res.status(200).json(this.responses.success["200_2"](this.transaction ,{ registers }));
        } catch (err) {
            console.log(err);
            return res.status(500).json(this.responses.error["500_1"](this.transaction));
        }
    };

}

module.exports = MonitoringController;
