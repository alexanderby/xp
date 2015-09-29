module xp.Log {

    /**
     * Message importance level.
     */
    export enum HeatLevel {
        Log = 1,
        Info = 2,
        Warn = 4,
        Error = 8
    }

    /**
     * Message domain.
     */
    export enum Domain {
        Misc = 16,
        Binding = 32,
        UI = 64,
        Test = 128
    }

    /**
     * Configures what output messages will be display.
     */
    export var DisplayMessages: HeatLevel|Domain = HeatLevel.Warn | HeatLevel.Error
        | Domain.Misc | Domain.Binding | Domain.UI | Domain.Test;

    /**
     * Writes a message to console.
     * @param level Importance level.
     * @param domain Domain.
     * @param msgOrAny Message or other item.
     * @param args Arguments to insert into formatting string.
     */
    export function write(level: HeatLevel, domain: Domain, msgOrAny: any) {
        if ((domain & <Domain>DisplayMessages) > 0
            && (level & <HeatLevel>DisplayMessages) > 0) {

            switch (level) {
                case HeatLevel.Log:
                    console.log(msgOrAny);
                    break;
                case HeatLevel.Info:
                    console.info(msgOrAny);
                    break;
                case HeatLevel.Warn:
                    console.warn(msgOrAny)
                    break;
                case HeatLevel.Error:
                    console.error(msgOrAny);
                    break;
                default:
                    throw new Error('Not implemented.');
            }
        }
    }

    // IE 9 HACK
    if (!window.console) window.console = <any>{};
    if (!window.console.log) window.console.log = function () { };
    if (!window.console.info) window.console.info = function () { };
    if (!window.console.warn) window.console.warn = function () { };
    if (!window.console.error) window.console.error = function () { };
}