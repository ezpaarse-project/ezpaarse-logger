// ID of the logger extension
const extensionId = 'cpjllnfdfhkmbkplldfndmfdbabcbidc';

const defaultSettings = {
  instance: 'other',
  ezpaarseUrl: 'http://127.0.0.1:59599',
  fullDisplay: false,
  proxySuffixes: [],
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
      const port = chrome.runtime.connect(extensionId);

      port.onMessage.addListener(info => {
        this.settings.proxySuffixes.forEach(suffix => {
          if (!suffix || !suffix.str) { return; }

          const reg = new RegExp(`^([a-z]+://[^/]+?)\.?${this.regEscape(suffix.str)}(/|$)`, 'i');
          info.url = info.url.replace(reg, '$1$2');
        });

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
    addHeader: function () { this.settings.headers.push({}); },
    removeHeader: function (index) { this.settings.headers.splice(index, 1); },
    addProxy: function () { this.settings.proxySuffixes.push({}); },
    removeProxy: function (index) { this.settings.proxySuffixes.splice(index, 1); },
    removeNoise: function () {
      this.requests = this.requests.filter(req => {
        if (!req.type) { return true; }

        switch (req.type) {
          case 'image':
          case 'script':
          case 'stylesheet':
          case 'font':
            return false;
        }

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
    regEscape: function (str) {
      return str.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
    },
    analyze: function () {
      let ezpaarseUrl;

      switch (this.settings.instance) {
      case 'prod':
        ezpaarseUrl = 'http://ezpaarse.couperin.org';
        break;
      case 'preprod':
        ezpaarseUrl = 'http://ezpaarse-preprod.couperin.org';
        break;
      default:
        ezpaarseUrl = this.settings.ezpaarseUrl;
      }

      if (!ezpaarseUrl) { return; }

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

      fetch(ezpaarseUrl, {
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
