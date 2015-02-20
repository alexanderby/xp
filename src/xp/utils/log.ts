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
    export var DisplayMessages: HeatLevel|Domain = HeatLevel.Info | HeatLevel.Warn | HeatLevel.Error
        | Domain.Misc | Domain.Binding | Domain.UI;

    /**
     * Writes a message to console.
     * @param level Importance level.
     * @param domain Domain.
     * @param msgOrAny Message (composite formatting string) or any other item.
     * @param args Arguments to insert into formatting string.
     */
    export function write(level: HeatLevel, domain: Domain, msgOrAny: any, ...args: any[]) {
        if ((domain & <Domain>DisplayMessages) > 0
            && (level & <HeatLevel>DisplayMessages) > 0) {

            var output;
            if (typeof msgOrAny === 'string') {
                args.unshift(msgOrAny);
                var output = xp.formatString.apply(null, args);
            }
            else {
                output = msgOrAny;
            }

            switch (level) {
                case HeatLevel.Log:
                    console.log(output);
                    break;
                case HeatLevel.Info:
                    console.info(output);
                    break;
                case HeatLevel.Warn:
                    console.warn(output)
                    break;
                case HeatLevel.Error:
                    console.error(output);
                    break;
                default:
                    throw new Error('Not implemented.');
            }
        }
    }
}