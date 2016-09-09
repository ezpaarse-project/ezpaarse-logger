// ID of the logger extension
const extensionId = 'cpjllnfdfhkmbkplldfndmfdbabcbidc';

const defaultSettings = {
  instance: 'other',
  ezpaarseUrl: 'http://127.0.0.1:59599',
  proxySuffixes: [],
  headers: [
    { name: 'Double-Click-Removal', value: 'false' }
  ],
  autoRemoveNoise: false
};

Vue.use(Keen);

const vm = new Vue({
  el: '#app',
  data: {
    settings: {},
    requests: [],
    counter: 0,
    detailed: null,
    show: {
      config: false,
      details: false,
      export: false
    },
    processing: false,
    export: null,
    menu: [
      { id: 1, text: 'Export', icon: 'file_upload' },
      { id: 2, text: 'Filter noise (scripts, images...)', icon: 'filter_list' },
      { type: 'divider' },
      { id: 3, text: 'Settings', icon: 'settings' },
      { id: 4, text: 'About', icon: 'info' }
    ],
    instanceOptions: [
      { text: 'National production', value: 'prod' },
      { text: 'National pre-production', value: 'preprod' },
      { text: 'Other', value: 'other' }
    ]
  },
  ready: function () {
    this.loadSettings();
    this.monitor();
  },
  methods: {
    menuSelect: function (selection) {
      switch (selection.id) {
      case 1: // Export
        this.toggleExport();
        break;
      case 2: // Remove noise
        this.removeNoise();
        break;
      case 3: // Config
        this.toggleConfig();
        break;
      case 4: // About
        window.open('https://github.com/ezpaarse-project/ezpaarse-logger');
        break;
      }
    },
    monitor: function () {
      // long-lived connection with the extension
      const port = chrome.runtime.connect(extensionId);

      port.onMessage.addListener(info => {
        if (this.settings.autoRemoveNoise && this.isNoisy(info)) { return; }

        this.settings.proxySuffixes.forEach(suffix => {
          if (!suffix || !suffix.str) { return; }

          const reg = new RegExp(`^([a-z]+://[^/]+?)\.?${this.regEscape(suffix.str)}(/|$)`, 'i');
          info.url = info.url.replace(reg, '$1$2');
        });

        const lengthHeader = (info.responseHeaders ||[]).find(header => /^content-length$/.test(header.name));

        this.requests.push({
          url: info.url,
          method: info.method,
          type: info.type,
          statusCode: info.statusCode,
          startDate: new Date(info.timeStamp),
          status: 'pending',
          id: ++this.counter,
          ec: null,
          contentLength: lengthHeader ? lengthHeader.value : null
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
    toggleConfig: function () { this.show.config = !this.show.config; },
    toggleExport: function () { this.show.export = !this.show.export; },
    setDetailed: function (req) {
      this.show.details = true;
      this.detailed = req;
    },
    clearDetails: function () { this.detailed = null; },
    clear: function () { this.requests = []; },
    addHeader: function () { this.settings.headers.push({}); },
    removeHeader: function (index) { this.settings.headers.splice(index, 1); },
    addProxy: function () { this.settings.proxySuffixes.push({}); },
    removeProxy: function (index) { this.settings.proxySuffixes.splice(index, 1); },
    removeNoise: function () {
      this.requests = this.requests.filter(req => !this.isNoisy(req));
    },
    isNoisy: function (req) {
      switch (req.type) {
        case 'image':
        case 'script':
        case 'stylesheet':
        case 'font':
          return true;
      }
      return false;
    },
    exportAsFile: function () {
      const dateFormat  = 'DD/MMM/YYYY:HH:mm:ss Z';
      const textContent = this.requests.map(req => {
        // 127.0.0.1 - - [14 /Mar/2014:09:39:18 -0700] “GET http://www.somedb.com:80/index.html HTTP/1.1” 200 1234
        return `127.0.0.1 - - [${moment(req.startDate).format(dateFormat)}] "${req.method} ${req.url} HTTP/1.1" ${req.statusCode} ${req.contentLength || 0}`;
      }).join('\r\n');

      saveAs(new Blob([textContent], { type: 'text/plain;charset=utf-8' }), 'export.log');
    },
    toLogLines: function (requests) {
      return requests.map(req => {
        return [
          req.startDate.getTime(),
          req.method,
          req.url,
          req.statusCode,
          req.contentLength || '-',
          req.id
        ].join(' ');
      }).join('\r\n');
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
        'Log-Format-EZproxy': '%{timestamp}<[0-9]+> %m %U %s %{size}<[0-9\\-]+> %{ezid}<[0-9]+>'
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
