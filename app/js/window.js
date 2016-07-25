// ID of the logger extension
const appId = "lpgokpcipeeocehamhgjakgehemfjojc";

const defaultSettings = {
  ezpaarseUrl: 'http://127.0.0.1:59599',
  fullDisplay: false,
  headers: [
    { name: 'Double-Click-Removal', value: 'false' }
  ]
};

const vm = new Vue({
  el: '#app',
  data: {
    settings: {},
    requests: [],
    counter: 0,
    detailed: null,
    showConfig: false,
    processing: false,
    export: null
  },
  ready: function () {
    this.loadSettings();
    this.monitor();
  },
  methods: {
    monitor: function () {
      // long-lived connection with the extension
      const port = chrome.runtime.connect(appId);

      port.onMessage.addListener(info => {
        this.requests.push({
          url: info.url,
          method: info.method,
          type: info.type,
          statusCode: info.statusCode,
          startDate: new Date(info.timeStamp),
          status: 'pending',
          id: ++this.counter,
          ec: null
        });
      });
    },
    saveSettings: function () {
      chrome.storage.local.set({ 'config': this.settings });
    },
    loadSettings: function () {
      chrome.storage.local.get('config', items => {
        this.settings = (items && items.config) || JSON.parse(JSON.stringify(defaultSettings));
      });
    },
    clearSettings: function () {
      chrome.storage.local.remove('config', this.loadSettings);
    },
    toggleConfig: function () { this.showConfig = !this.showConfig; },
    setDetailed: function (req) { this.detailed = req; },
    clearDetails: function () { this.detailed = null; },
    clear: function () { this.requests = []; },
    addHeader: function (name) {
      this.settings.headers.push({});
    },
    removeHeader: function (index) {
      this.settings.headers.splice(index, 1);
    },
    removeNoise: function () {
      this.requests = this.requests.filter(req => {
        if (!req.type) { return true; }

        if (req.type.startsWith('image/')) { return false; }
        if (req.type.endsWith('/javascript')) { return false; }
        if (req.type.endsWith('/css')) { return false; }

        return true;
      });
    },
    showExport: function () {
      this.export = this.toLogLines(this.requests);
    },
    clearExport: function () {
      this.export = null;
    },
    toLogLines: function (requests) {
      return requests.map(req => {
        return [
          req.startDate.getTime(),
          req.method,
          req.url,
          req.statusCode,
          req.id
        ].join(' ');
      }).join('\n');
    },
    analyze: function () {
      const pending = this.requests.filter(req => {
        if (req.status === 'pending' || req.status === 'error') {
          req.status = 'processing';
          return true;
        }
        return false;
      });

      if (pending.length === 0) { return; }

      this.processing = true;

      const logs = this.toLogLines(pending);
      const headers = {
        'Accept': 'application/json',
        'Log-Format-EZproxy': '%{timestamp}<[0-9]+> %m %U %s %{ezid}<[0-9]+>'
      };

      this.settings.headers.forEach(h => {
        headers[h.name] = h.value;
      });

      fetch(this.settings.ezpaarseUrl, {
        method: 'POST',
        body: logs,
        headers: headers
      }).then(response => {
        if (response.status !== 200) {
          throw new Error('Got status', response.status);
        }
        return response.json().catch(err => { return []; });
      }).then(ecs => {
        this.processing = false;

        const ecMap = {};
        ecs.forEach(ec => {
          if (ec.ezid) { ecMap[ec.ezid] = ec; }
        });

        pending.forEach(req => {
          req.ec = ecMap[req.id] || null;
          req.status = req.ec ? 'analyzed' : 'rejected';
        });

      }).catch(err => {
        this.processing = false;
        console.error(err);
        pending.forEach(req => { req.status = 'error'; });
      });
    }
  }
});
