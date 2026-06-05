import { useEffect, useRef, useState, useCallback } from 'react';

interface UseLazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

/**
 * 懒加载 Hook - 使用 Intersection Observer 检测元素是否进入视口
 * @param options Intersection Observer 配置选项
 * @returns ref 引用和 isVisible 状态
 * 
 * 使用示例：
 * const { ref, isVisible } = useLazyLoad();
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible && <HeavyComponent />}
 *   </div>
 * );
 */
export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0.1,
    enabled = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((node: Element | null) => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }

    elementRef.current = node;

    if (node && enabled) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // 一旦可见，停止观察以节省性能
            observerRef.current?.unobserve(node);
          }
        },
        { root, rootMargin, threshold }
      );
      observerRef.current.observe(node);
    }
  }, [root, rootMargin, threshold, enabled]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { ref: setRef, isVisible, elementRef };
}

/**
 * 图片懒加载 Hook - 延迟加载图片直到进入视口
 * @param src 图片源地址
 * @param options Intersection Observer 配置选项
 * @returns ref 引用、isLoaded 状态和当前src（未加载时为空）
 * 
 * 使用示例：
 * const { ref, isLoaded, src: imgSrc } = useLazyLoadImage('/path/to/image.jpg');
 * 
 * return (
 *   <img ref={ref} src={imgSrc || undefined} alt="lazy" />
 * );
 */
export function useLazyLoadImage(src: string, options: UseLazyLoadOptions = {}) {
  const { ref, isVisible } = useLazyLoad(options);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return {
    ref,
    isLoaded,
    isVisible,
    src: isVisible ? src : undefined,
    onLoad: handleLoad,
  };
}
