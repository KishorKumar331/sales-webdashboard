import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { loadQuotationDraft, saveQuotationDraft } from "../storage/quotationDraft";

/* ===================== Debounce Hook ===================== */

function useDebounced(fn, delay = 700) {
  const timerRef = useRef(null);
  const fnRef = useRef(fn);

  // Always keep latest fn reference
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  return useCallback(
    (...args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/* ===================== Main Hook ===================== */
/**
 * Handles RHF initialization + async draft load + debounced autosave
 *
 * @param {string} tripId - Trip ID
 * @param {object} defaults - Default RHF values
 * @param {boolean} skipDraftLoad - Skip loading cached draft (used when opening existing quotation)
 * @param {string|null} uniqueId - QuoteId or similar (forces reset when changed)
 */
export function useQuotationDraft(
  tripId,
  defaults,
  skipDraftLoad = false,
  uniqueId = null
) {
  const [loading, setLoading] = useState(true);

  const methods = useForm({
    defaultValues: defaults,
    mode: "onChange",
  });

  const defaultsRef = useRef(defaults);

  /* ---------- Keep defaults in ref ---------- */
  useEffect(() => {
    defaultsRef.current = defaults;
  }, [defaults]);

  /* ---------- Load draft or reset ---------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      console.log(
        `🔄 useQuotationDraft: tripId=${tripId}, skipDraftLoad=${skipDraftLoad}, uniqueId=${uniqueId}`
      );

      if (!mounted) return;
      setLoading(true);

      // Opening existing quotation → no draft restore
      if (skipDraftLoad) {
        console.log("⏭️ Skipping draft load, using fresh defaults");
        methods.reset(defaultsRef.current);
        setLoading(false);
        return;
      }

      const saved = tripId ? await loadQuotationDraft(tripId) : null;

      if (!mounted) return;

      if (saved) {
        console.log(`✅ Draft found for TripId: ${tripId}`);
        methods.reset({
          ...defaultsRef.current,
          ...saved,
        });
      } else {
        console.log(`❌ No draft found for TripId: ${tripId}`);
        methods.reset(defaultsRef.current);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [tripId, skipDraftLoad, uniqueId]);

  /* ---------- Save logic ---------- */
  const saveValues = useCallback(
    (values) => {
      // Do NOT autosave when viewing existing quotations
      if (tripId && !skipDraftLoad) {
        saveQuotationDraft(tripId, values);
      }
    },
    [tripId, skipDraftLoad]
  );

  const debouncedSave = useDebounced(saveValues, 700);

  /* ---------- Autosave watcher ---------- */
  useEffect(() => {
    if (skipDraftLoad) return;

    const subscription = methods.watch((values) => {
      debouncedSave(values);
    });

    return () => subscription.unsubscribe();
  }, [methods, debouncedSave, skipDraftLoad]);

  return { methods, loading };
}
