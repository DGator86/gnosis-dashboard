import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SymbolInfo,
  TradeIdea,
  Alert,
  Position,
  Order,
  User,
  TimeFrame,
  ChartType,
  Indicator,
} from "../types";

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserPreferences: (preferences: Partial<User["preferences"]>) => void;

  // Symbols & Watchlist
  symbols: SymbolInfo[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  reorderWatchlist: (fromIndex: number, toIndex: number) => void;

  // Chart settings
  timeFrame: TimeFrame;
  chartType: ChartType;
  indicators: Indicator[];
  setTimeFrame: (timeFrame: TimeFrame) => void;
  setChartType: (chartType: ChartType) => void;
  toggleIndicator: (indicator: Indicator) => void;

  // Trade Ideas
  tradeIdeas: TradeIdea[];
  addTradeIdea: (idea: Omit<TradeIdea, "id" | "createdAt">) => void;

  // Alerts
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, "id" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;

  // Orders & Positions
  orders: Order[];
  positions: Position[];
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void;
  updatePosition: (position: Position) => void;

  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Notifications
  notifications: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;
  addNotification: (message: string, type: "success" | "error" | "info") => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      symbols: [],
      selectedSymbol: "SPY",
      timeFrame: "1D",
      chartType: "LINE",
      indicators: [],
      tradeIdeas: [],
      alerts: [],
      orders: [],
      positions: [],
      theme: "dark",
      notifications: [],

      // Auth actions
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockUser: User = {
          id: "1",
          email,
          name: email.split("@")[0],
          watchlist: ["SPY", "QQQ", "TSLA", "AAPL"],
          preferences: {
            theme: "dark",
            defaultTimeFrame: "1D",
            defaultChartType: "LINE",
            notifications: {
              email: true,
              push: true,
              priceAlerts: true,
              tradeIdeas: true,
            },
          },
        };
        set({ user: mockUser, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUserPreferences: (preferences) => {
        const user = get().user;
        if (user) {
          set({
            user: {
              ...user,
              preferences: { ...user.preferences, ...preferences },
            },
          });
        }
      },

      // Symbol actions
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

      addToWatchlist: (symbol) => {
        const user = get().user;
        if (user && !user.watchlist.includes(symbol)) {
          set({
            user: {
              ...user,
              watchlist: [...user.watchlist, symbol],
            },
          });
        }
      },

      removeFromWatchlist: (symbol) => {
        const user = get().user;
        if (user) {
          set({
            user: {
              ...user,
              watchlist: user.watchlist.filter((s) => s !== symbol),
            },
          });
        }
      },

      reorderWatchlist: (fromIndex, toIndex) => {
        const user = get().user;
        if (user) {
          const newWatchlist = [...user.watchlist];
          const [moved] = newWatchlist.splice(fromIndex, 1);
          newWatchlist.splice(toIndex, 0, moved);
          set({
            user: {
              ...user,
              watchlist: newWatchlist,
            },
          });
        }
      },

      // Chart actions
      setTimeFrame: (timeFrame) => set({ timeFrame }),
      setChartType: (chartType) => set({ chartType }),

      toggleIndicator: (indicator) => {
        const indicators = get().indicators;
        const exists = indicators.find((i) => i.type === indicator.type);
        if (exists) {
          set({
            indicators: indicators.filter((i) => i.type !== indicator.type),
          });
        } else {
          set({ indicators: [...indicators, indicator] });
        }
      },

      // Trade Ideas actions
      addTradeIdea: (idea) => {
        const newIdea: TradeIdea = {
          ...idea,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set({ tradeIdeas: [newIdea, ...get().tradeIdeas] });
      },

      // Alerts actions
      addAlert: (alert) => {
        const newAlert: Alert = {
          ...alert,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set({ alerts: [...get().alerts, newAlert] });
      },

      removeAlert: (id) => {
        set({ alerts: get().alerts.filter((a) => a.id !== id) });
      },

      toggleAlert: (id) => {
        set({
          alerts: get().alerts.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        });
      },

      // Order actions
      addOrder: (order) => {
        const newOrder: Order = {
          ...order,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set({ orders: [newOrder, ...get().orders] });
      },

      updatePosition: (position) => {
        const positions = get().positions;
        const existingIndex = positions.findIndex(
          (p) => p.symbol === position.symbol
        );
        if (existingIndex >= 0) {
          const newPositions = [...positions];
          newPositions[existingIndex] = position;
          set({ positions: newPositions });
        } else {
          set({ positions: [...positions, position] });
        }
      },

      // Theme actions
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        set({ theme: newTheme });
      },

      // Notification actions
      addNotification: (message, type) => {
        const notification = {
          id: Date.now().toString(),
          message,
          type,
        };
        set({ notifications: [...get().notifications, notification] });
        setTimeout(() => {
          get().removeNotification(notification.id);
        }, 5000);
      },

      removeNotification: (id) => {
        set({ notifications: get().notifications.filter((n) => n.id !== id) });
      },
    }),
    {
      name: "gnosis-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        timeFrame: state.timeFrame,
        chartType: state.chartType,
        indicators: state.indicators,
      }),
    }
  )
);
