import { GetConfig, NewBackendConfig, SetConfig, SystemConfig, ChromeConfigItems } from "./internal/utils/config";
import { Application, Backend, Launcher } from "./internal/application";

class popup implements Launcher {

    public async start() {
        let cfg = document.getElementsByTagName("input");
        for (let i = 0; i < cfg.length; i++) {
            let el = cfg.item(i);
            let key = el.getAttribute("config-key");
            if (key != "") {
                let pop = this;
                el.onchange = async function () {
                    let promptMsg = (<HTMLElement>this).getAttribute("prompt");
                    if (promptMsg !== null && !localStorage[key + "_prompt"]) {
                        let msg = prompt(promptMsg);
                        if (msg !== "yes") {
                            (<HTMLInputElement>this).value = await Application.App.config.get(key) || 1;
                            return;
                        }
                        localStorage[key + "_prompt"] = true;
                    }
                    switch ((<HTMLInputElement>this).type) {
                        case "checkbox": {
                            Application.App.config.set(key, (<HTMLInputElement>this).checked);
                            break;
                        }
                        default: {
                            Application.App.config.set(key, (<HTMLInputElement>this).value);
                        }
                    }
                };
                this.defaultVal(el, key);
            }
        }
        Application.CheckUpdate(function (isnew, data) {
            let v: number;
            if (data === undefined) {
                (<HTMLImageElement>document.getElementById("tiku")).src = "./../img/error.svg";
                v = SystemConfig.version;
            } else {
                if (isnew) {
                    var p = document.createElement('p');
                    p.style.color = "#ff0000";
                    p.innerHTML = '有新的版本更新:<a href="' + data.url + '" style="float:right;" target="_blank">点我去下载</a>  最新版本:v' + data.version;
                    document.getElementsByTagName('body')[0].appendChild(p);
                }
                document.getElementById("injection").innerHTML = data.injection;
                v = (SystemConfig.version > data.hotversion ? SystemConfig.version : data.hotversion);
            }
            document.getElementById('version').innerHTML = 'v' + v;
        });
    }

    private async defaultVal(el: HTMLInputElement, key: string) {
        let def = el.getAttribute("default-val");
        let val = await Application.App.config.get(key);
        switch (el.type) {
            case "checkbox": {
                if (def === "true") {
                    el.checked = val == undefined || val;
                    return;
                }
                el.checked = val || false;
                return;
            }
            default: {
                el.value = val || def;
                return;
            }
        }
    }
}

window.onload = function () {
    let config = NewBackendConfig();
    let component = new Map<string, any>().
        set("config", new ChromeConfigItems(config, config));
    let app = new Application(Backend, new popup(), component);
    app.run();
};
