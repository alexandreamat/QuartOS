// Copyright (C) 2024 Alexandre Amat
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { useState } from "react";

function useStack<T>(initialValue: T[]) {
  const [stack, setStack] = useState<T[]>(initialValue);

  function push(item: T) {
    setStack((s) => [...s, item]);
  }

  function pop(): T {
    const itemOut = stack.at(-1)!;
    setStack((s) => s.slice(0, -1));
    return itemOut;
  }

  function peek(): T {
    return stack.at(-1)!;
  }

  function clear() {
    setStack([]);
  }

  return {
    stack,
    push,
    pop,
    peek,
    clear,
  };
}

export default useStack;
