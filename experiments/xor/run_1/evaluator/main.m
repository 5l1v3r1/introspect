terminal_size();
initState = [2.435359450304137; -0.7283707400455232; 0.1474934900352721; -1.5324502134635793];
for bit1 = 0:1
  for bit2 = 0:1
    for bit3 = 0:1
      [state, out] = timestep(bit1, initState(1:2), initState(3:4), true);
      [state, out] = timestep(bit2, state, out);
      [state, out, inVal, inGate, remGate, outGate] = timestep(bit3, state, out);
      s = format_nums([inVal' inGate' remGate' outGate']);
      disp(["| " int2str(bit1) int2str(bit2) int2str(bit3) " | " s]);
    end
  end
end
