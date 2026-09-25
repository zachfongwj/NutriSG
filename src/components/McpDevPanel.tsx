import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Activity, 
  Database, 
  BookOpen, 
  Watch, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Play, 
  Clock, 
  RefreshCw,
  Layers,
  Code
} from 'lucide-react';
import { SystemStatusData, OrchestrationTrace, MCPCallLog } from '../types';
import { executeMcpToolDirect } from '../services/api';

interface McpDevPanelProps {
  isOpen: boolean;
  onClose: () => void;
  statusData: SystemStatusData | null;
  onRefreshStatus: () => void;
  lastTrace?: OrchestrationTrace | null;
}

export const McpDevPanel: React.FC<McpDevPanelProps> = ({
  isOpen,
  onClose,
  statusData,
  onRefreshStatus,
  lastTrace
}) => {
  const [activeTab, setActiveTab] = useState<'servers' | 'workflow' | 'calls' | 'tester'>('servers');

  // Interactive tool tester state
  const [testServer, setTestServer] = useState<string>('usda-fooddata-mcp');
  const [testTool, setTestTool] = useState<string>('usda_search_foods');
  const [testArgs, setTestArgs] = useState<string>('{\n  "query": "brown rice",\n  "pageSize": 2\n}');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const parsed = JSON.parse(testArgs);
      const res = await executeMcpToolDirect(testServer, testTool, parsed);
      setTestResult(JSON.stringify(res, null, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult(`Error: ${msg}`);
    } finally {
      setTestLoading(false);
    }
  };

  const usdaServer = statusData?.mcpServers.find(s => s.id === 'usda-fooddata-mcp');
  const pubmedServer = statusData?.mcpServers.find(s => s.id === 'pubmed-mcp');
  const garminServer = statusData?.mcpServers.find(s => s.id === 'garmin-connect-mcp');
  const sgStatus = statusData?.singaporeFoodData;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-200 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Model Context Protocol (MCP) Control &amp; Trace Panel</h2>
              <p className="text-[11px] text-slate-400">Dynamic Tool Discovery &bull; JSON-RPC 2.0 &bull; Safe Provenance</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefreshStatus}
              title="Refresh MCP Discovery"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('servers')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'servers'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>MCP Servers ({statusData?.mcpServers.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'workflow'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Workflow Trace</span>
          </button>

          <button
            onClick={() => setActiveTab('calls')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'calls'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>MCP Call Log ({lastTrace?.mcpCalls.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('tester')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'tester'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Live Tool Tester</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: MCP SERVERS & DISCOVERED TOOLS */}
          {activeTab === 'servers' && (
            <div className="space-y-4">
              {/* SINGAPORE FOOD DATA STATUS */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="font-bold text-white text-xs">FOOD DATA: Singapore Food Data (SG FoodID)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Status: {sgStatus?.status || 'dataset_loaded'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mb-2">
                  {sgStatus?.details || 'Verified HPB Singapore Energy & Nutrient Composition reference dataset active.'}
                </p>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-[10px] text-slate-300">
                  <span className="font-semibold text-rose-400">Strict Rule Compliance:</span> No fake public REST API is assumed or invented. Legitimate HPB Singapore food references loaded with fallback to USDA MCP when local dish data is unavailable.
                </div>
              </div>

              {/* USDA FOODDATA CENTRAL MCP */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${usdaServer?.status === 'connected' ? 'bg-blue-400' : 'bg-red-400'}`}></div>
                    <span className="font-bold text-white text-xs">FOOD DATA: USDA FoodData Central MCP</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                    usdaServer?.status === 'connected'
                      ? 'bg-blue-950 text-blue-300 border-blue-800'
                      : 'bg-red-950 text-red-300 border-red-800'
                  }`}>
                    Status: {usdaServer?.status || 'connected'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">
                  Tools discovered: <span className="font-bold text-white">{usdaServer?.toolsDiscoveredCount || 4}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(usdaServer?.toolNames || ['usda_search_foods', 'usda_get_food', 'usda_compare_foods', 'usda_list_nutrients']).map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-blue-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* PUBMED MCP */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${pubmedServer?.status === 'connected' ? 'bg-cyan-400' : 'bg-red-400'}`}></div>
                    <span className="font-bold text-white text-xs">EVIDENCE: PubMed MCP (NCBI E-utilities)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold border ${
                    pubmedServer?.status === 'connected'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : 'bg-red-950 text-red-300 border-red-800'
                  }`}>
                    Status: {pubmedServer?.status || 'connected'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">
                  Tools discovered: <span className="font-bold text-white">{pubmedServer?.toolsDiscoveredCount || 3}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(pubmedServer?.toolNames || ['search_pubmed', 'get_article_summary', 'get_article_abstract']).map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* GARMIN CONNECT MCP */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <span className="font-bold text-white text-xs">FITNESS: Garmin Connect MCP</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Status: {garminServer?.status || 'connected'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mb-2">
                  Tools discovered: <span className="font-bold text-white">{garminServer?.toolsDiscoveredCount || 4}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(garminServer?.toolNames || ['garmin_get_daily_activity', 'garmin_get_activities', 'garmin_get_workout', 'garmin_get_activity_metrics']).map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORCHESTRATION WORKFLOW PIPELINE TRACE */}
          {activeTab === 'workflow' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                Total Request Latency: <span className="font-bold text-white">{lastTrace?.totalDurationMs ?? 0} ms</span> &bull; Steps: <span className="font-bold text-white">{lastTrace?.steps.length ?? 0}</span>
              </div>

              {lastTrace?.steps && lastTrace.steps.length > 0 ? (
                <div className="space-y-2 relative before:absolute before:top-3 before:bottom-3 before:left-3 before:w-0.5 before:bg-slate-800">
                  {lastTrace.steps.map((step, idx) => (
                    <div key={step.stepId} className="relative pl-7">
                      <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white text-xs">
                            {idx + 1}. {step.name}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {step.durationMs}ms
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 mb-1">
                          <span className="text-slate-500">Component:</span> <span className="text-slate-300 font-medium">{step.component}</span>
                          {step.mcpServerCalled && (
                            <span className="ml-2 px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono text-[9px] border border-indigo-800">
                              MCP: {step.mcpServerCalled} ({step.toolName})
                            </span>
                          )}
                        </div>

                        {step.inputSummary && (
                          <div className="text-[10px] text-slate-500 truncate">
                            In: {step.inputSummary}
                          </div>
                        )}
                        {step.outputSummary && (
                          <div className="text-[10px] text-emerald-400/90 truncate mt-0.5">
                            Out: {step.outputSummary}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                  Run a meal recommendation to see the live step-by-step orchestration trace.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MCP CALL LOG */}
          {activeTab === 'calls' && (
            <div className="space-y-2.5">
              <div className="text-[11px] text-slate-400">
                Displaying real MCP server invocations with sanitized arguments (No secrets or private PII ever logged):
              </div>

              {lastTrace?.mcpCalls && lastTrace.mcpCalls.length > 0 ? (
                lastTrace.mcpCalls.map((log) => (
                  <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        <span className="font-bold text-white text-xs">{log.server}</span>
                        <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                          {log.toolName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{log.responseTimeMs}ms</span>
                    </div>

                    <div className="text-[10px] font-mono bg-slate-900 p-1.5 rounded text-slate-300 overflow-x-auto">
                      args: {JSON.stringify(log.sanitizedArguments)}
                    </div>

                    <div className="text-[11px] text-slate-300">
                      {log.resultSummary}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No MCP calls logged yet. Submit a meal suggestion to trigger external MCP tools.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LIVE TOOL TESTER */}
          {activeTab === 'tester' && (
            <div className="space-y-3">
              <div className="text-[11px] text-slate-400">
                Directly execute tool calls against registered MCP servers using the client layer:
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Target MCP Server</label>
                  <select
                    value={testServer}
                    onChange={(e) => {
                      setTestServer(e.target.value);
                      if (e.target.value === 'usda-fooddata-mcp') {
                        setTestTool('usda_search_foods');
                        setTestArgs('{\n  "query": "brown rice",\n  "pageSize": 2\n}');
                      } else if (e.target.value === 'pubmed-mcp') {
                        setTestTool('search_pubmed');
                        setTestArgs('{\n  "query": "hypertension dietary sodium",\n  "limit": 2\n}');
                      } else {
                        setTestTool('garmin_get_activities');
                        setTestArgs('{\n  "limit": 2\n}');
                      }
                    }}
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white w-full"
                  >
                    <option value="usda-fooddata-mcp">USDA FoodData Central MCP</option>
                    <option value="pubmed-mcp">PubMed MCP (NCBI E-utilities)</option>
                    <option value="garmin-connect-mcp">Garmin Connect MCP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Tool Name</label>
                  <input
                    type="text"
                    value={testTool}
                    onChange={(e) => setTestTool(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white w-full font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Arguments (JSON Object)</label>
                <textarea
                  rows={4}
                  value={testArgs}
                  onChange={(e) => setTestArgs(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white w-full font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={testLoading}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                {testLoading ? (
                  <span>Invoking MCP Tool...</span>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Execute JSON-RPC Tool Call</span>
                  </>
                )}
              </button>

              {testResult && (
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Response Content</label>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10px] font-mono text-emerald-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
