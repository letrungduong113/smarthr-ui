import React, { VFC, createContext, useCallback, useLayoutEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { Theme, useTheme } from '../../hooks/useTheme'

import { ContentBoxStyle, Rect, getContentBoxStyle, getFirstTabbable } from './dropdownHelper'
import { DropdownCloser } from './DropdownCloser'
import { useKeyboardNavigation } from './useKeyboardNavigation'

type Props = {
  triggerRect: Rect
  scrollable: boolean
  children: React.ReactNode
  className: string
  controllable: boolean
}

type DropdownContentInnerContextType = {
  maxHeight: string
}

export const DropdownContentInnerContext = createContext<DropdownContentInnerContextType>({
  maxHeight: '',
})

export const DropdownContentInner: VFC<Props> = ({
  triggerRect,
  scrollable,
  children,
  className,
  controllable,
}) => {
  const theme = useTheme()
  const [isActive, setIsActive] = useState(false)
  const [contentBox, setContentBox] = useState<ContentBoxStyle>({
    top: '0',
    left: '0',
    maxHeight: '',
  })
  const wrapperRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (wrapperRef.current) {
      setContentBox(
        getContentBoxStyle(
          triggerRect,
          {
            width: wrapperRef.current.offsetWidth,
            height: wrapperRef.current.offsetHeight,
          },
          {
            width: innerWidth,
            height: innerHeight,
          },
          {
            top: pageYOffset,
            left: pageXOffset,
          },
        ),
      )
      setIsActive(true)
    }
  }, [triggerRect])

  const focusContent = useCallback(() => {
    // delay for waiting to change the inner contents to visible
    const firstTabbale = getFirstTabbable(wrapperRef)
    if (firstTabbale) {
      firstTabbale.focus()
      return true
    }
    return false
  }, [])

  useLayoutEffect(() => {
    if (isActive) {
      // when the dropdwon content becomes active, focus a first tabbable element in it
      setTimeout(() => {
        // delay for waiting to change the inner contents to visible
        if (!focusContent()) {
          setTimeout(() => {
            focusContent()
          }, 100)
        }
      }, 30)
    }
  }, [isActive, focusContent])

  useKeyboardNavigation(wrapperRef)

  return (
    <Wrapper
      ref={wrapperRef}
      contentBox={contentBox}
      className={`${className} ${isActive ? 'active' : ''}`}
      themes={theme}
    >
      {controllable ? (
        <ControllableWrapper scrollable={scrollable} contentBox={contentBox}>
          {children}
        </ControllableWrapper>
      ) : (
        <DropdownContentInnerContext.Provider value={{ maxHeight: contentBox.maxHeight }}>
          <DropdownCloser>{children}</DropdownCloser>
        </DropdownContentInnerContext.Provider>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  themes: Theme
  contentBox: ContentBoxStyle
}>`
  ${({ contentBox, themes }) => {
    const { color, radius, zIndex, shadow } = themes

    return css`
      display: flex;
      visibility: hidden;
      z-index: ${zIndex.OVERLAP_BASE};
      position: absolute;
      top: ${contentBox.top};
      left: ${contentBox.left};
      border-radius: ${radius.m};
      box-shadow: ${shadow.LAYER3};
      background-color: ${color.WHITE};
      white-space: nowrap;

      &.active {
        visibility: visible;
      }
    `
  }}
`
const ControllableWrapper = styled.div<{
  contentBox: ContentBoxStyle
  scrollable: boolean
}>`
  ${({ contentBox, scrollable }) => {
    return css`
      display: flex;
      flex-direction: column;
      ${contentBox.maxHeight && scrollable
        ? `
          max-height: ${contentBox.maxHeight};
          `
        : ''}
    `
  }}
`
